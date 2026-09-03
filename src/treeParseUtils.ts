import { Rule, Selector, mergeSelectors } from './Rule.js';
import { Sheet } from './Sheet.js';
import { distributiveLonghands } from './shorthands.js';
import {
  CSSVariablesObject,
  ClassSet,
  CreateSheetInput,
  DirectClass,
  Styles,
} from './types.js';
import { asArray } from './utils/asArray.js';
import { forIn } from './utils/forIn.js';
import { camelCaseToDash } from './utils/stringManipulators';
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
      createDeclarationRules(selector, property, value).forEach((rule) => {
        sheet.addRule(rule);
        output.add(rule.hash);
      });
    }

    return addEachClass(res, output);
  });

  return output;
}

function addEachClass(list: string[] | Set<string>, to: Set<string>) {
  list.forEach((className) => to.add(className));
  return to;
}

// Builds one atomic rule per longhand when a distributive shorthand
// carries a single-token value, so cx() can later remove only the
// overridden side while the unaffected sides survive. Anything else
// stays one atomic rule.
function createDeclarationRules(
  selector: Selector,
  property: string,
  value: string,
): Rule[] {
  const longhands = expandableLonghands(property, value);
  if (!longhands) {
    return [selector.createRule(property, value)];
  }
  return longhands.map((longhand) => selector.createRule(longhand, value));
}

function expandableLonghands(
  property: string,
  value: string,
): string[] | undefined {
  const found = distributiveLonghands(camelCaseToDash(property));
  if (!found || !isSingleTokenValue(value)) {
    return undefined;
  }
  return found;
}

// A value distributes verbatim only when it holds a single token.
// Multi-value shorthands (`1px 2px`) assign sides positionally and must
// stay atomic; whitespace inside functional notation (`calc(1px + 2px)`)
// does not count as a separator.
function isSingleTokenValue(value: unknown): value is string | number {
  if (typeof value === 'number') {
    return true;
  }
  return typeof value === 'string' && hasNoTopLevelWhitespace(value);
}

function hasNoTopLevelWhitespace(value: string): boolean {
  let depth = 0;
  for (const char of value) {
    depth = nextDepth(depth, char);
    if (depth === 0 && isWhitespace(char)) {
      return false;
    }
  }
  return true;
}

function nextDepth(depth: number, char: string): number {
  if (char === '(') {
    return depth + 1;
  }
  if (char === ')') {
    return Math.max(0, depth - 1);
  }
  return depth;
}

function isWhitespace(char: string): boolean {
  return char === ' ' || char === '\t' || char === '\n' || char === '\r';
}

// eslint-disable-next-line max-statements
function cssVariablesBlock(
  sheet: Sheet,
  styles: CSSVariablesObject,
  selector: Selector,
) {
  const classes: ClassSet = new Set<string>();
  const chunkRows: string[] = [];
  const scope = selector.scopeClassName;

  forIn(styles, (property: string, value) => {
    if (isValidProperty(property, value)) {
      if (scope) {
        const rule = selector.createRule(property, value);
        classes.add(sheet.addRule(rule));
        return;
      }
      chunkRows.push(Rule.genRule(property, value));
      return;
    }
    const res = iterateStyles(sheet, value ?? {}, selector);
    addEachClass(res, classes);
  });

  if (!scope && chunkRows.length) {
    // Variables with no scope (e.g. directly under a precondition) have no
    // class to hand back, but dropping them silently would lose declarations.
    appendAmbientVariables(sheet, chunkRows.join(' '), selector);
  }

  return classes;
}

function appendAmbientVariables(
  sheet: Sheet,
  css: string,
  selector: Selector,
): void {
  let selectors = mergeSelectors(selector.preconditions, {});
  selectors = mergeSelectors(selector.postconditions, {
    left: selectors,
  });

  if (selectors) {
    sheet.append(`${selectors} {${css}}`);
  }
}

function handleMediaQuery(
  sheet: Sheet,
  styles: Styles,
  mediaQuery: string,
  selector: Selector,
) {
  const mark = sheet.getLength();
  sheet.append(mediaQuery + ' {');
  const innerMark = sheet.getLength();

  // iterateStyles will internally append each rule to the sheet
  // as needed. All we have to do is just open the block and close it after.
  // The at-rule is part of the selector so identical declarations inside and
  // outside of it never share a deduplication entry.
  const output = iterateStyles(sheet, styles, selector.addAtRule(mediaQuery));

  // Nothing was appended inside the block (e.g. every rule deduplicated
  // against identical declarations already on the sheet): drop the opener.
  if (sheet.getLength() === innerMark) {
    sheet.truncate(mark);
    return output;
  }

  sheet.append('}');
  return output;
}
