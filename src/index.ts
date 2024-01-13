import { Rule, Selector, mergeSelectors } from './Rule.js';
import { Sheet } from './Sheet.js';
import {
  CSSVariablesObject,
  ClassSet,
  CreateSheetInput,
  DirectClass,
  ScopedStyles,
  Styles,
  createSheetReturn,
} from './types.js';
import { asArray } from './utils/asArray.js';
import { forIn } from './utils/forIn.js';
import {
  isCssVariables,
  isDirectClass,
  isMediaQuery,
  isStyleCondition,
  isValidProperty,
} from './utils/is.js';

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

    iteratePreconditions(sheet, styles, new Selector(sheet)).forEach(
      ([scopeName, styles, selector]) => {
        iterateStyles(sheet, styles as Styles, selector).forEach(
          (className) => {
            addScopedStyle(scopeName as K, className);
          },
        );
      },
    );

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

// This one plucks out all of the preconditions
// and creates selector objects from them
function iteratePreconditions(
  sheet: Sheet,
  styles: Styles,
  selector: Selector,
) {
  const output: Array<[string, Styles, Selector]> = [];

  forIn(styles, (key: string, value) => {
    if (isStyleCondition(key)) {
      return iteratePreconditions(
        sheet,
        value as Styles,
        selector.addPrecondition(key),
      ).forEach((item) => output.push(item));
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore - this is a valid case
    output.push([key, styles[key], selector.addScope(key)]);
  });

  return output;
}

function iterateStyles(
  sheet: Sheet,
  styles: Styles,
  selector: Selector,
): ClassSet {
  const output: ClassSet = new Set<string>();
  // eslint-disable-next-line max-statements
  forIn(styles, (property, value) => {
    let res: string[] | Set<string> = [];

    // Postconditions
    if (isStyleCondition(property)) {
      res = iterateStyles(
        sheet,
        value as Styles,
        selector.addPostcondition(property),
      );
      // Direct classes: ".": "className"
    } else if (isDirectClass(property)) {
      res = asArray(value as DirectClass);
    } else if (isMediaQuery(property)) {
      res = handleMediaQuery(sheet, value as Styles, property, selector);

      // "--": { "--variable": "value" }
    } else if (isCssVariables(property)) {
      res = cssVariablesBlock(sheet, value as CSSVariablesObject, selector);

      // "property": "value"
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

// eslint-disable-next-line max-statements
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

  if (!selector.scopeClassName) {
    return classes;
  }

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
