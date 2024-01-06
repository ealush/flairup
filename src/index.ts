import { Sheet } from './Sheet.js';
import {
  CSSVariablesObject,
  ClassSet,
  CreateSheetInput,
  ScopedStyles,
  StyleObject,
  Styles,
  createSheetReturn,
} from './types.js';
import { forIn } from './utils/forIn.js';
import { is } from './utils/is.js';
import { stableHash } from './utils/stableHash.js';
import {
  chunkSelector,
  genLine,
  wrapWithCurlys,
} from './utils/stringManipulators.js';

export { cx } from './cx.js';

export function createSheet(name: string): createSheetReturn {
  const sheet = new Sheet(name);

  return {
    create,
    getStyle: sheet.getStyle.bind(sheet),
    isApplied: sheet.isApplied.bind(sheet),
  };

  function create<K extends string>(styles: CreateSheetInput<K>) {
    const scopedStyles: ScopedStyles<K> = {} as ScopedStyles<K>;

    forIn(styles, (scopeName, styles) => {
      // This handles a class that's wrapping a scoped style.
      // This allows us setting sort of a "precondition" selector for the scoped styles.

      if (is.topLevelClass(scopeName, styles)) {
        forIn(styles, (childScope, value) => {
          // This is an actual scoped style, so we need to iterate over it.
          const scopeClassName = stableHash(sheet.name, childScope);

          iterateStyles(
            sheet,
            value as Styles,
            scopeClassName,
            scopeName.slice(1), // Remove the dot
          ).forEach((className: string) => {
            addScopedStyle(childScope as unknown as K, className);
          });
        });
        return;
      }

      const scopeClassName = stableHash(sheet.name, scopeName);

      // Handles the default case in which we have a scope directly on the root level.
      iterateStyles(sheet, styles as Styles, scopeClassName).forEach(
        (className) => {
          addScopedStyle(scopeName as K, className);
        },
      );
    });

    sheet.apply();

    return scopedStyles;

    function addScopedStyle(name: K, className: string) {
      scopedStyles[name as keyof ScopedStyles<K>] =
        scopedStyles[name as keyof ScopedStyles<K>] ?? new Set<string>();
      scopedStyles[name as keyof ScopedStyles<K>].add(className);
    }
  }
}

function iterateStyles(
  sheet: Sheet,
  styles: Styles,
  scopeClassName: string,
  parentClassName?: string,
) {
  const output: ClassSet = new Set<string>();
  forIn(styles, (property, value) => {
    if (is.directClass(property, value)) {
      return handleAddedClassnames(value).forEach((classes) =>
        output.add(classes),
      );
    }

    if (is.mediaQuery(property, value)) {
      return handleMediaQuery(sheet, value, property, scopeClassName).forEach(
        (className) => output.add(className),
      );
    }

    if (
      is.pseudoSelector(property, value) ||
      is.cssVariables(property, value)
    ) {
      return handleChunks(sheet, value, property, scopeClassName).forEach(
        (classes) => output.add(classes),
      );
    }

    if (is.validProperty(property, value)) {
      const ruleClassName = sheet.addRule(property, value, parentClassName);
      return output.add(ruleClassName);
    }
  });

  return output;
}

function handleAddedClassnames(classes: string | string[]) {
  return [].concat(classes as unknown as []);
}

function handleChunks(
  sheet: Sheet,
  styles: StyleObject | CSSVariablesObject,
  property: string,
  scopeClassName: string,
) {
  const classes: ClassSet = new Set<string>();

  const chunkRows: string[] = [];
  forIn(styles, (property: string, value) => {
    if (is.validProperty(property, value)) {
      chunkRows.push(genLine(property, value));
      return;
    }

    iterateStyles(sheet, value ?? {}, scopeClassName).forEach((className) =>
      classes.add(className),
    );
  });

  if (chunkRows.length) {
    const output = chunkRows.join(' ');
    sheet.append(
      `${chunkSelector([scopeClassName], property)} ${wrapWithCurlys(
        output,
        true,
      )}`,
    );
  }

  classes.add(scopeClassName);
  return classes;
}

function handleMediaQuery(
  sheet: Sheet,
  styles: Styles,
  property: string,
  scopeClassName: string,
) {
  sheet.append(chunkSelector([scopeClassName], property) + ' {');

  const output = iterateStyles(sheet, styles, scopeClassName);

  sheet.append('}');

  return output;
}
