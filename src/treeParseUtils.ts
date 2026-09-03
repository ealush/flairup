import { Rule, Selector, mergeSelectors } from './Rule.js';
import { Sheet } from './Sheet.js';
import { DistributiveKind, distributiveExpansion } from './shorthands.js';
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

// Builds one atomic rule per longhand when a distributive shorthand can
// be split soundly, so cx() can later remove only the overridden side
// while the unaffected sides survive. Anything else stays one atomic
// rule, which is always valid CSS even when the shorthand is not.
function createDeclarationRules(
  selector: Selector,
  property: string,
  value: string,
): Rule[] {
  const expanded = expandShorthand(property, value);
  if (!expanded) {
    return [selector.createRule(property, value)];
  }
  return expanded.map(([longhand, token]) =>
    selector.createRule(longhand, token),
  );
}

type PreparedShorthand = {
  kind: DistributiveKind;
  longhands: string[];
  tokens: string[];
  slash: boolean;
  important: boolean;
};

function expandShorthand(
  property: string,
  value: string,
): Array<[string, string]> | undefined {
  const prepared = prepareShorthand(property, value);
  if (!prepared) {
    return undefined;
  }
  return expandPrepared(prepared);
}

function prepareShorthand(
  property: string,
  value: string,
): PreparedShorthand | undefined {
  const expansion = distributiveExpansion(camelCaseToDash(property));
  if (!expansion) {
    return undefined;
  }
  return expandTokens(expansion, String(value));
}

function expandTokens(
  expansion: { kind: DistributiveKind; longhands: string[] },
  value: string,
): PreparedShorthand | undefined {
  const { text, important } = splitImportant(value);
  if (isOpaqueValue(text)) {
    return undefined;
  }
  const { tokens, slash } = tokenizeValue(text);
  if (tokens.length === 0) {
    return undefined;
  }
  return {
    kind: expansion.kind,
    longhands: expansion.longhands,
    tokens,
    slash,
    important,
  };
}

function expandPrepared(
  prepared: PreparedShorthand,
): Array<[string, string]> | undefined {
  const { longhands, tokens, important } = prepared;
  if (tokens.length === 1) {
    const only = tokens[0];
    if (!only) {
      return undefined;
    }
    return longhands.map<[string, string]>((longhand) => [
      longhand,
      withImportant(only, important),
    ]);
  }
  return expandPositional(prepared);
}

// Positional assignment per CSS: 2 values split top/bottom vs sides,
// 3 values add an explicit bottom, 4 values go top/right/bottom/left,
// and pairs (gap, overflow) split first/second.
const quadSides: Record<number, number[]> = {
  2: [0, 1, 0, 1],
  3: [0, 1, 2, 1],
  4: [0, 1, 2, 3],
};

const pairSides: Record<number, number[]> = {
  2: [0, 1],
};

function expandPositional(
  prepared: PreparedShorthand,
): Array<[string, string]> | undefined {
  const { kind, longhands, tokens, slash, important } = prepared;
  if (slash) {
    return undefined;
  }
  const sides =
    kind === 'pair' ? pairSides[tokens.length] : quadSides[tokens.length];
  if (!sides) {
    return undefined;
  }
  const positional = kind === 'box' ? longhands.slice(0, 4) : longhands;
  return assignPositional(positional, sides, tokens, important);
}

function assignPositional(
  positional: string[],
  sides: number[],
  tokens: string[],
  important: boolean,
): Array<[string, string]> {
  const output: Array<[string, string]> = [];
  sides.forEach((tokenIndex, index) => {
    const longhand = positional[index];
    const token = tokens[tokenIndex];
    if (longhand !== undefined && token !== undefined) {
      output.push([longhand, withImportant(token, important)]);
    }
  });
  return output;
}

function withImportant(token: string, important: boolean): string {
  return important ? `${token} !important` : token;
}

function splitImportant(text: string): { text: string; important: boolean } {
  const match = /^(.*?)\s*!important\s*$/i.exec(text);
  if (!match) {
    return { text, important: false };
  }
  return { text: (match[1] ?? '').trim(), important: true };
}

// A bare var()/env()/attr() reference can resolve to any number of
// tokens, so expanding it could turn a valid shorthand into invalid
// longhands. Nested references (e.g. inside calc()) still resolve to a
// single value and remain expandable.
function isOpaqueValue(text: string): boolean {
  const trimmed = text.trim();
  const open = /^(var|env|attr)\(/i.exec(trimmed);
  if (!open) {
    return false;
  }
  return closesAtEnd(trimmed, open[0].length - 1);
}

function closesAtEnd(trimmed: string, start: number): boolean {
  let depth = 0;
  for (let index = start; index < trimmed.length; index++) {
    depth = Math.max(0, depth + parenDelta(trimmed[index]));
    if (depth === 0) {
      return index === trimmed.length - 1;
    }
  }
  return true;
}

function parenDelta(char: string | undefined): number {
  if (char === '(') {
    return 1;
  }
  if (char === ')') {
    return -1;
  }
  return 0;
}

// Splits on top-level whitespace only: spaces inside functional notation
// (`calc(1px + 2px)`) stay glued to their token. Also reports a top-level
// `/`, which marks elliptical/complex values. Quotes need no tracking:
// they cannot appear in a valid value for these properties, and for
// invalid values both paths degrade to rules the browser drops.
type TokenScan = {
  current: string;
  depth: number;
  slash: boolean;
};

function tokenizeValue(text: string): { tokens: string[]; slash: boolean } {
  const tokens: string[] = [];
  const state: TokenScan = { current: '', depth: 0, slash: false };
  for (const char of text) {
    stepTokenChar(state, char, tokens);
  }
  pushToken(tokens, state);
  return { tokens, slash: state.slash };
}

function stepTokenChar(state: TokenScan, char: string, tokens: string[]): void {
  state.depth = Math.max(0, state.depth + parenDelta(char));
  if (state.depth === 0 && isWhitespace(char)) {
    pushToken(tokens, state);
    return;
  }
  if (state.depth === 0 && char === '/') {
    state.slash = true;
  }
  state.current += char;
}

function pushToken(tokens: string[], state: TokenScan): void {
  if (state.current) {
    tokens.push(state.current);
    state.current = '';
  }
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
