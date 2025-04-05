import { Rule, Selector, mergeSelectors } from './Rule.js';
import { Sheet } from './Sheet.js';
import {
  CSSVariablesObject,
  ClassSet,
  CreateSheetInput,
  DirectClass,
  Styles,
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

export type { CreateSheetInput, Styles };

// This one plucks out all of the preconditions
// and creates selector objects from them
export function iterateTopLevel(
  sheet: Sheet,
  styles: Styles,
  selector: Selector,
): {
  preconditions: Array<[string, Styles, Selector]>;
} {
  const output: {
    preconditions: Array<[string, Styles, Selector]>;
  } = {
    preconditions: [],
  };

  forIn(styles, (key: string, value) => {
    if (isStyleCondition(key)) {
      const res = iterateTopLevel(
        sheet,
        value as Styles,
        selector.addPrecondition(key),
      );
      res.preconditions.forEach((item) => output.preconditions.push(item));
      return output;
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore - this is a valid case
    output.preconditions.push([key, styles[key], selector.addScope(key)]);
    return output;
  });

  return output;
}

export function iterateStyles(
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
