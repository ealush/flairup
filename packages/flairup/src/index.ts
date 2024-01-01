import { Sheet } from './Sheet.ts';
import { ClassSet, ScopedStyles, StyleObject, Styles } from './types.ts';
import { forIn } from './utils/forIn.ts';
import { is } from './utils/is.ts';
import { stableHash } from './utils/stableHash.ts';
import {
  chunkSelector,
  genCssRules,
  genLine,
  wrapWithCurlys,
} from './utils/stringManipulators.ts';

export function cx(...styles: ClassSet[]): string {
  return styles
    .reduce((acc, curr) => {
      return `${acc} ${Array.from(curr).join(' ')}`;
    }, '')
    .trim();
}

type createSheetReturn = {
  create: <K extends string>(styles: Styles<K>) => ScopedStyles<K>;
  getStyle: () => string;
};

export function createSheet(name: string): createSheetReturn {
  const sheet = new Sheet(name);

  return {
    create,
    getStyle: sheet.getStyle.bind(sheet),
  };

  function create<K extends string>(styles: Styles<K>) {
    const scopedStyles: ScopedStyles<K> = {} as ScopedStyles<K>;

    forIn(styles, (scopeName, styles) => {
      if (is.topLevelClass(scopeName, styles)) {
        const scopeClassName = stableHash(sheet.name, scopeName);
        const parentClass = scopeName.slice(1);
        forIn(styles, (property, value) => {
          iterateStyles(
            sheet,
            value as Styles<K>,
            scopeClassName,
            parentClass,
          ).forEach((className: string) => {
            addScopedStyle(property as unknown as K, className);
          });
        });
        return;
      }
      const scopeClassName = stableHash(sheet.name, scopeName);
      iterateStyles(sheet, styles as Styles<K>, scopeClassName).forEach(
        (className) => {
          addScopedStyle(scopeName as K, className);
        },
      );
    });

    sheet.apply();

    return scopedStyles;

    function addScopedStyle(name: K, className: string) {
      scopedStyles[name] = scopedStyles[name] ?? new Set<string>();
      scopedStyles[name].add(className);
    }
  }
}

function iterateStyles<K extends string>(
  sheet: Sheet,
  styles: Styles<K>,
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
    if (
      is.pseudoSelector(property) ||
      is.mediaQuery(property) ||
      is.cssVariables(property, value)
    ) {
      return handleChunks(sheet, value ?? {}, property, scopeClassName).forEach(
        (classes) => output.add(classes),
      );
    }

    if (is.validProperty(value)) {
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
  styles: StyleObject,
  property: string,
  scopeClassName: string,
) {
  const classes: ClassSet = new Set<string>();

  const chunkRows: string[] = [];
  forIn(styles, (property: string, value) => {
    if (is.validProperty(value)) {
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
        is.mediaQuery(property)
          ? genCssRules([scopeClassName], output)
          : output,
        true,
      )}`,
    );
  }

  classes.add(scopeClassName);
  return classes;
}
