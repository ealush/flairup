import { addKeyframes } from './keyframes.js';
import { Selector } from './Rule.js';
import { Sheet, resolveSheetRoot } from './Sheet.js';
import { iterateTopLevel, iterateStyles } from './treeParseUtils.js';
import {
  CreateSheetInput,
  CreateSheetOptions,
  KeyframesOutput,
  ScopedStyles,
  SheetRootNode,
  Styles,
  createSheetReturn,
  keyframesInput,
} from './types.js';

export { cx } from './cx.js';

export type { CreateSheetInput, CreateSheetOptions, SheetRootNode, Styles };

export function createSheet(
  name: string,
  rootNode?: SheetRootNode | CreateSheetOptions,
): createSheetReturn {
  const sheet = resolveSheet(name, rootNode);

  return {
    create: genCreate(sheet),
    keyframes: genKeyframes(sheet),
    getStyle: sheet.getStyle.bind(sheet),
    isApplied: sheet.isApplied.bind(sheet),
  };
}

const defaultSheets: Map<string, Sheet> = new Map();
const nullSheets: Map<string, Sheet> = new Map();
const rootedSheets: WeakMap<object, Map<string, Sheet>> = new WeakMap();

function resolveSheet(
  name: string,
  root: SheetRootNode | CreateSheetOptions | undefined,
): Sheet {
  const resolved = resolveSheetRoot(root);
  const cached = findCachedSheet(name, resolved.rootNode);
  if (cached && !cached.isDetached()) {
    syncNonce(cached, resolved.nonce);
    return cached;
  }
  const sheet = new Sheet(name, root);
  storeCachedSheet(name, resolved.rootNode, sheet);
  return sheet;
}

function findCachedSheet(
  name: string,
  rootNode: SheetRootNode | undefined,
): Sheet | undefined {
  if (rootNode === undefined) {
    return defaultSheets.get(name);
  }
  if (rootNode === null) {
    return nullSheets.get(name);
  }
  const scoped = rootedSheets.get(rootNode);
  return scoped?.get(name);
}

function storeCachedSheet(
  name: string,
  rootNode: SheetRootNode | undefined,
  sheet: Sheet,
): void {
  if (rootNode === undefined) {
    defaultSheets.set(name, sheet);
    return;
  }
  if (rootNode === null) {
    nullSheets.set(name, sheet);
    return;
  }
  storeRootedSheet(rootNode, name, sheet);
}

function storeRootedSheet(
  rootNode: object,
  name: string,
  sheet: Sheet,
): void {
  let scoped = rootedSheets.get(rootNode);
  if (!scoped) {
    scoped = new Map<string, Sheet>();
    rootedSheets.set(rootNode, scoped);
  }
  scoped.set(name, sheet);
}

function syncNonce(sheet: Sheet, nonce: string | undefined): void {
  if (nonce !== undefined && nonce !== sheet.getNonce()) {
    sheet.setNonce(nonce);
  }
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
    const output = addKeyframes(sheet, keyframesInput);
    // Commit the keyframes to a mounted style element, if there is one.
    sheet.apply();
    return output;
  };
}
