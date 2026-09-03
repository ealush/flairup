import { registerClassConflict } from './classRegistry.js';
import { Rule } from './Rule.js';
import { CreateSheetOptions, SheetRootNode, StoredStyles } from './types.js';
import { isString } from './utils/is.js';
import {
  appendString,
  appendStringInline,
} from './utils/stringManipulators.js';

export class Sheet {
  private styleTag: HTMLStyleElement | undefined;

  // Hash->css
  private storedStyles: StoredStyles = {};

  // styles->hash
  private storedClasses: Record<string, string> = {};
  private style: string = '';
  private rootNode: SheetRootNode | undefined;
  private nonce: string | undefined;
  public count = 0;
  public id: string;

  constructor(
    public name: string,
    root?: SheetRootNode | CreateSheetOptions,
  ) {
    this.id = `flairup-${name}`;

    const resolved = resolveSheetRoot(root);
    this.rootNode = resolved.rootNode;
    this.nonce = resolved.nonce;
    this.styleTag = this.createStyleTag();
  }

  getStyle(): string {
    return this.style;
  }

  append(css: string): void {
    this.style = appendString(this.style, css);
  }

  appendInline(css: string): void {
    this.style = appendStringInline(this.style, css);
  }

  seq(): number {
    return this.count++;
  }

  apply(): void {
    this.seq();

    if (!this.styleTag) {
      return;
    }

    this.styleTag.innerHTML = this.style;
  }

  isApplied(): boolean {
    return !!this.styleTag;
  }

  createStyleTag(): HTMLStyleElement | undefined {
    // check that we're in the browser and have access to the DOM
    if (
      typeof document === 'undefined' ||
      this.isApplied() ||
      // Explicitly disallow mounting to the DOM
      this.rootNode === null
    ) {
      return this.styleTag;
    }

    return this.adoptStyleTag() ?? this.mountStyleTag();
  }

  addRule(rule: Rule): string {
    const storedClass = this.storedClasses[rule.key];

    if (isString(storedClass)) {
      return storedClass;
    }

    this.storedClasses[rule.key] = rule.hash;
    this.storedStyles[rule.hash] = [rule.property, rule.value];
    registerClassConflict(rule.hash, rule.getConflictKey());

    this.append(rule.toString());
    return rule.hash;
  }

  private adoptStyleTag(): HTMLStyleElement | undefined {
    const existing = this.findExistingStyleTag();

    if (!existing) {
      return undefined;
    }

    // Adopt server-rendered content so hydration never drops it.
    this.style = existing.innerHTML;
    this.applyNonce(existing);
    return existing;
  }

  private mountStyleTag(): HTMLStyleElement {
    const styleTag = document.createElement('style');
    styleTag.type = 'text/css';
    styleTag.id = this.id;
    this.applyNonce(styleTag);
    this.getMountTarget().appendChild(styleTag);
    return styleTag;
  }

  private getMountTarget(): HTMLElement | ShadowRoot {
    return this.rootNode ?? document.head;
  }

  private findExistingStyleTag(): HTMLStyleElement | undefined {
    const scope = this.rootNode ?? document;
    const existing = scope.querySelector(`style#${this.id}`);

    if (existing && existing.tagName === 'STYLE') {
      return existing as HTMLStyleElement;
    }

    return undefined;
  }

  private applyNonce(styleTag: HTMLStyleElement): void {
    if (!this.nonce) {
      return;
    }

    styleTag.setAttribute('nonce', this.nonce);
  }
}

function resolveSheetRoot(
  root: SheetRootNode | CreateSheetOptions | undefined,
): {
  rootNode: SheetRootNode | undefined;
  nonce: string | undefined;
} {
  if (!root || isRootNode(root)) {
    return { rootNode: root, nonce: undefined };
  }

  return { rootNode: root.rootNode, nonce: root.nonce };
}

function isRootNode(
  value: SheetRootNode | CreateSheetOptions,
): value is HTMLElement | ShadowRoot {
  return typeof (value as HTMLElement).nodeType === 'number';
}
