import { registerClassConflict } from './classRegistry.js';
import { Rule, toCssIdent } from './Rule.js';
import { coveredProperties } from './shorthands.js';
import { CreateSheetOptions, SheetRootNode, StoredStyles } from './types.js';
import { isKeyframes, isMediaQuery, isString } from './utils/is.js';
import {
  appendString,
  appendStringInline,
} from './utils/stringManipulators.js';

const ruleLinePattern = /^\.([A-Za-z0-9_-]+)\s*\{\s*(.+?)\s*\}\s*$/;
const keyframesPattern = /^@keyframes\s+([A-Za-z0-9_-]+)\s*\{$/;

interface AdoptedRule {
  hash: string;
  prop: string;
  value: string;
}

interface StyleTagLookup {
  getElementsByTagName?: (qualifiedName: string) => HTMLCollection;
}

export class Sheet {
  private styleTag: HTMLStyleElement | undefined;

  // Hash->css
  private storedStyles: StoredStyles = {};

  // styles->hash
  private storedClasses: Record<string, string> = {};
  private adoptedTexts: Set<string> = new Set();
  private adoptedKeyframes: Map<string, string> = new Map();
  private usedKeyframeNames: Set<string> = new Set();
  private style: string = '';
  private rootNode: SheetRootNode | undefined;
  private nonce: string | undefined;
  private keyframesCount = 0;
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

  keyframeSeq(): number {
    return this.keyframesCount++;
  }

  getLength(): number {
    return this.style.length;
  }

  truncate(length: number): void {
    this.style = this.style.slice(0, length);
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

  isDetached(): boolean {
    return this.styleTag !== undefined && !this.styleTag.isConnected;
  }

  getNonce(): string | undefined {
    return this.nonce;
  }

  setNonce(nonce: string | undefined): void {
    this.nonce = nonce;
    if (this.styleTag && nonce) {
      this.styleTag.setAttribute('nonce', nonce);
    }
  }

  adoptedRuleText(text: string): boolean {
    return this.adoptedTexts.has(text.trim());
  }

  adoptedKeyframeBody(name: string): string | undefined {
    return this.adoptedKeyframes.get(name);
  }

  isKeyframeNameTaken(name: string): boolean {
    return this.adoptedKeyframes.has(name) || this.usedKeyframeNames.has(name);
  }

  markKeyframeNameUsed(name: string): void {
    this.usedKeyframeNames.add(name);
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

    const final = this.resolveHash(rule);
    this.commitRule(rule, final);
    return final;
  }

  private resolveHash(rule: Rule): string {
    let final = rule.hash;
    let counter = 0;
    while (this.isHashTaken(final, rule)) {
      counter += 1;
      final = `${rule.hash}_${counter}`;
    }
    return final;
  }

  private isHashTaken(hash: string, rule: Rule): boolean {
    const stored = this.storedStyles[hash];
    return (
      stored !== undefined &&
      (stored[0] !== rule.property || stored[1] !== rule.value)
    );
  }

  private commitRule(rule: Rule, hash: string): void {
    rule.hash = hash;
    this.storedClasses[rule.key] = hash;
    this.storedStyles[hash] = [rule.property, rule.value];
    registerClassConflict(hash, rule.getConflictKeys());
    this.appendUnlessAdopted(rule);
  }

  private appendUnlessAdopted(rule: Rule): void {
    const text = rule.toString();
    if (!this.adoptedTexts.has(text.trim())) {
      this.append(text);
    }
  }

  private adoptStyleTag(): HTMLStyleElement | undefined {
    const existing = this.findExistingStyleTag();

    if (!existing) {
      return undefined;
    }

    // Adopt server-rendered content so hydration never drops it.
    const css = existing.innerHTML;
    this.style = css;
    this.applyNonce(existing);
    this.hydrateFromStyle(css);
    return existing;
  }

  private hydrateFromStyle(css: string): void {
    const lines = css.split('\n');
    const stack: string[] = [];
    let index = 0;
    while (index < lines.length) {
      const line = lines[index];
      if (line === undefined) {
        break;
      }
      index = this.hydrateLine(lines, line.trim(), stack, index);
    }
  }

  private hydrateLine(
    lines: string[],
    line: string,
    stack: string[],
    index: number,
  ): number {
    if (isKeyframes(line) && keyframesPattern.test(line)) {
      return this.adoptKeyframesBlock(lines, index);
    }
    if (!this.trackStructure(line, stack)) {
      this.adoptRuleLine(line, stack.join('|'));
    }
    return index + 1;
  }

  private trackStructure(line: string, stack: string[]): boolean {
    if (isMediaOpener(line)) {
      stack.push(mediaOpenerText(line));
      return true;
    }
    if (line === '}') {
      stack.pop();
      return true;
    }
    return false;
  }

  private adoptRuleLine(line: string, atKey: string): void {
    if (!line) {
      return;
    }
    this.adoptedTexts.add(line);
    const parsed = parseAdoptedRule(line, this.name);
    if (parsed) {
      this.storeAdoptedRule(parsed, atKey);
    }
  }

  private storeAdoptedRule(rule: AdoptedRule, atKey: string): void {
    const joined = `${rule.prop}:${rule.value}`;
    this.storedClasses[[joined, '', atKey, ''].join('\0')] = rule.hash;
    this.storedStyles[rule.hash] = [rule.prop, rule.value];
    registerClassConflict(
      rule.hash,
      coveredProperties(rule.prop).map((prop) => conflictKey(prop, atKey)),
    );
  }

  private adoptKeyframesBlock(lines: string[], index: number): number {
    const end = findBlockEnd(lines, index);
    if (end < 0) {
      return index + 1;
    }
    const opener = lines[index];
    const name = opener === undefined ? '' : parseKeyframeName(opener.trim());
    if (name) {
      this.adoptedKeyframes.set(
        name,
        stripWhitespace(lines.slice(index, end + 1).join('\n')),
      );
    }
    return end + 1;
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
    const lookup = scope as unknown as StyleTagLookup;
    if (typeof lookup.getElementsByTagName === 'function') {
      return this.findTagById(lookup.getElementsByTagName('style'));
    }
    return findStyleTagById(scope, this.id);
  }

  private findTagById(tags: HTMLCollection): HTMLStyleElement | undefined {
    for (let i = 0; i < tags.length; i++) {
      const tag = tags[i];
      if (tag && tag.id === this.id && tag.tagName === 'STYLE') {
        return tag as HTMLStyleElement;
      }
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

export function resolveSheetRoot(
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

function isMediaOpener(line: string): boolean {
  return line.endsWith('{') && isMediaQuery(mediaOpenerText(line));
}

function mediaOpenerText(line: string): string {
  return line.slice(0, -1).trim();
}

function conflictKey(prop: string, atKey: string): string {
  return [prop, '', '', atKey].join('\0');
}

function stripWhitespace(value: string): string {
  return value.replace(/\s+/g, '');
}

function findBlockEnd(lines: string[], start: number): number {
  for (let i = start + 1; i < lines.length; i++) {
    if (lines[i]?.trim() === '}') {
      return i;
    }
  }
  return -1;
}

function parseKeyframeName(opener: string): string {
  const match = keyframesPattern.exec(opener);
  return match?.[1] ?? '';
}

function parseAdoptedRule(
  line: string,
  sheetName: string,
): AdoptedRule | undefined {
  const match = ruleLinePattern.exec(line);
  const hash = match?.[1];
  const body = match?.[2];
  if (!hash || !body || !isSheetHash(hash, sheetName)) {
    return undefined;
  }
  const declaration = splitDeclaration(body);
  if (!declaration) {
    return undefined;
  }
  return { hash, prop: declaration[0], value: declaration[1] };
}

function isSheetHash(hash: string, sheetName: string): boolean {
  return hash.startsWith(`${toCssIdent(sheetName)}_`);
}

function splitDeclaration(body: string): [string, string] | undefined {
  const parts = body
    .split(';')
    .map((part) => part.trim())
    .filter((part) => part !== '');
  const only = parts[0];
  if (parts.length !== 1 || !only) {
    return undefined;
  }
  const separator = only.indexOf(':');
  if (separator < 0) {
    return undefined;
  }
  return [only.slice(0, separator).trim(), only.slice(separator + 1).trim()];
}

function findStyleTagById(node: Node, id: string): HTMLStyleElement | undefined {
  const children = node.childNodes;
  for (let i = 0; i < children.length; i++) {
    const found = findStyleTagInChild(children[i], id);
    if (found) {
      return found;
    }
  }
  return undefined;
}

function findStyleTagInChild(
  child: Node | undefined,
  id: string,
): HTMLStyleElement | undefined {
  if (!child) {
    return undefined;
  }
  const element = child as Element;
  if (element.tagName === 'STYLE' && element.id === id) {
    return element as HTMLStyleElement;
  }
  return findStyleTagById(child, id);
}
