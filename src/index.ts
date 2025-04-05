import { addKeyframes } from './keyframes.js';
import { Selector } from './Rule.js';
import { Sheet } from './Sheet.js';
import { iterateTopLevel, iterateStyles } from './treeParseUtils.js';
import {
  CreateSheetInput,
  KeyframesOutput,
  ScopedStyles,
  Styles,
  createSheetReturn,
  keyframesInput,
} from './types.js';

export { cx } from './cx.js';

export type { CreateSheetInput, Styles };

export function createSheet(
  name: string,
  rootNode?: HTMLElement | null,
): createSheetReturn {
  const sheet = new Sheet(name, rootNode);

  return {
    create: genCreate(sheet),
    keyframes: genKeyframes(sheet),
    getStyle: sheet.getStyle.bind(sheet),
    isApplied: sheet.isApplied.bind(sheet),
  };
}

function genCreate<K extends string>(
  sheet: Sheet,
): (styles: CreateSheetInput<K>) => ScopedStyles<K> & ScopedStyles<string> {
  return function create(styles: CreateSheetInput<K>) {
    const scopedStyles: ScopedStyles<K> = {} as ScopedStyles<K>;

    const topLevel = iterateTopLevel(sheet, styles, new Selector(sheet));

    topLevel.preconditions.forEach(([scopeName, styles, selector]) => {
      iterateStyles(sheet, styles as Styles, selector).forEach((className) => {
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
  };
}

function genKeyframes<KF extends string>(sheet: Sheet) {
  return function keyframes(
    keyframesInput: keyframesInput<KF>,
  ): KeyframesOutput<KF> {
    return addKeyframes(sheet, keyframesInput);
  };
}
