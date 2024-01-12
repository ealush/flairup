import { Rule, Selector, mergeSelectors } from './Rule.js';
import { Sheet } from './Sheet.js';
import {
  CSSVariablesObject,
  ClassSet,
  CreateSheetInput,
  DirectClass,
  PreConditions,
  ScopedStyles,
  Styles,
  createSheetReturn,
} from './types.js';
import { asArray } from './utils/asArray.js';
import { forIn } from './utils/forIn.js';
import {
  isClassName,
  isCssVariables,
  isDirectClass,
  isMediaQuery,
  isPostCondition,
  isValidProperty,
} from './utils/is.js';
import { stableHash } from './utils/stableHash.js';

export { cx } from './cx.js';

// eslint-disable-next-line max-lines-per-function
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

      if (isClassName(scopeName)) {
        forIn(styles as PreConditions<K>, (childScope, value) => {
          // This is an actual scoped style, so we need to iterate over it.
          const scopeClassName = stableHash(sheet.name, childScope);
          iterateStyles(
            sheet,
            value as Styles,
            new Selector(sheet, scopeClassName, {
              preconditions: scopeName,
            }),
          ).forEach((className: string) => {
            addScopedStyle(childScope as unknown as K, className);
          });
        });
        return;
      }

      const scopeClassName = stableHash(sheet.name, scopeName);

      // Handles the default case in which we have a scope directly on the root level.
      iterateStyles(
        sheet,
        styles as Styles,
        new Selector(sheet, scopeClassName, {}),
      ).forEach((className) => {
        addScopedStyle(scopeName as K, className);
      });
    });

    // Commit the styles to the sheet.
    // Done only once per create call.
    // This way we do not update the DOM on every style.
    sheet.apply();

    return scopedStyles;

    function addScopedStyle(name: K, className: string) {
      scopedStyles[name as keyof ScopedStyles<K>] =
        scopedStyles[name as keyof ScopedStyles<K>] ?? new Set<string>();
      scopedStyles[name as keyof ScopedStyles<K>].add(className);
    }
  }
}

function iterateStyles(sheet: Sheet, styles: Styles, selector: Selector) {
  const output: ClassSet = new Set<string>();
  // eslint-disable-next-line max-statements
  forIn(styles, (property, value) => {
    let res: string[] | Set<string> = [];

    if (isPostCondition(property)) {
      res = iterateStyles(
        sheet,
        value as Styles,
        selector.addPostcondition(property),
      );
    } else if (isDirectClass(property)) {
      res = asArray(value as DirectClass);
    } else if (isMediaQuery(property)) {
      res = handleMediaQuery(sheet, value as Styles, property, selector);
    } else if (isCssVariables(property)) {
      res = cssVariablesBlock(sheet, value as CSSVariablesObject, selector);
    } else if (isValidProperty(property, value)) {
      const rule = selector.createRule(property, value);
      sheet.addRule(rule);
      output.add(rule.hash);
    }

    return addEachClass(res, output);
  });

  return output;
}

function addEachClass(list: string[] | Set<string>, to: Set<string>) {
  list.forEach((className) => to.add(className));
  return to;
}

function cssVariablesBlock(
  sheet: Sheet,
  styles: CSSVariablesObject,
  selector: Selector,
) {
  const classes: ClassSet = new Set<string>();

  const chunkRows: string[] = [];
  forIn(styles, (property: string, value) => {
    if (isValidProperty(property, value)) {
      chunkRows.push(Rule.genRule(property, value));
      return;
    }

    const res = iterateStyles(sheet, value ?? {}, selector);
    addEachClass(res, classes);
  });

  if (chunkRows.length) {
    const output = chunkRows.join(' ');
    sheet.append(
      `${mergeSelectors(selector.preconditions, {
        right: selector.scopeClassName,
      })} {${output}}`,
    );
  }

  classes.add(selector.scopeClassName);
  return classes;
}

function handleMediaQuery(
  sheet: Sheet,
  styles: Styles,
  mediaQuery: string,
  selector: Selector,
) {
  sheet.append(mediaQuery + ' {');

  // iterateStyles will internally append each rule to the sheet
  // as needed. All we have to do is just open the block and close it after.
  const output = iterateStyles(sheet, styles, selector);

  sheet.append('}');

  return output;
}
