import { Sheet } from './Sheet.js';
import {
  ClassSet,
  ParentClass,
  ScopedStyles,
  StyleObject,
  Styles,
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

type S<K extends string> = Exclude<K, ParentClass>;

type createSheetReturn = {
  create: <K extends string>(
    styles: Styles<K> & Record<ParentClass, Styles<K>>,
  ) => ScopedStyles<S<K>>;
  getStyle: () => string;
  isApplied: () => boolean;
};

export function createSheet(name: string): createSheetReturn {
  const sheet = new Sheet(name);

  return {
    create,
    getStyle: sheet.getStyle.bind(sheet),
    isApplied: sheet.isApplied.bind(sheet),
  };

  function create<K extends string>(
    styles: Styles<K> & Record<ParentClass, Styles<K>>,
  ) {
    const scopedStyles: ScopedStyles<K> = {} as ScopedStyles<K>;

    forIn(styles, (scopeName, styles) => {
      const scopeClassName = stableHash(sheet.name, scopeName);
      if (is.topLevelClass(scopeName, styles)) {
        forIn(styles, (property, value) => {
          iterateStyles(
            sheet,
            value as Styles<K>,
            scopeClassName,
            scopeName.slice(1),
          ).forEach((className: string) => {
            addScopedStyle(property as unknown as K, className);
          });
        });
        return;
      }
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

    if (is.mediaQuery(property)) {
      return handleMediaQuery(
        sheet,
        value ?? {},
        property,
        scopeClassName,
      ).forEach((className) => output.add(className));
    }

    if (is.pseudoSelector(property) || is.cssVariables(property, value)) {
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
  styles: Styles<string>,
  property: string,
  scopeClassName: string,
) {
  sheet.append(chunkSelector([scopeClassName], property) + ' {');

  const output = iterateStyles(sheet, styles, scopeClassName);

  sheet.append('}');

  return output;
}
