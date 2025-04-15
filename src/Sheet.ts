import { Rule } from './Rule.js';
import { StoredStyles } from './types.js';
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
  public count = 0;
  public id: string;

  constructor(
    public name: string,
    private rootNode?: HTMLElement | null,
  ) {
    this.id = `flairup-${name}`;

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

    const styleTag = document.createElement('style');
    styleTag.type = 'text/css';
    styleTag.id = this.id;
    (this.rootNode ?? document.head).appendChild(styleTag);
    return styleTag;
  }

  addRule(rule: Rule): string {
    const storedClass = this.storedClasses[rule.key];

    if (isString(storedClass)) {
      return storedClass;
    }

    this.storedClasses[rule.key] = rule.hash;
    this.storedStyles[rule.hash] = [rule.property, rule.value];

    this.append(rule.toString());
    return rule.hash;
  }
}
