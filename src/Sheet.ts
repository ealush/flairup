import { StoredStyles } from './types.js';
import { is } from './utils/is.js';
import { stableHash } from './utils/stableHash.js';
import {
  appendString,
  genCssRule,
  joinedProperty,
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

  constructor(public name: string) {
    this.id = `flairup-${name}`;

    this.styleTag = this.createStyleTag();
  }

  getStyle(): string {
    return this.style;
  }

  append(css: string): void {
    this.style = appendString(this.style, css);
  }

  apply(): void {
    this.count++;

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
    if (typeof document === 'undefined' || this.isApplied()) {
      return;
    }

    const styleTag = document.createElement('style');
    styleTag.type = 'text/css';
    styleTag.id = this.id;
    document.head.appendChild(styleTag);
    return styleTag;
  }

  addRule(property: string, value: string, parentClassName?: string): string {
    const key = joinedProperty(property, value);

    const storedClass = this.storedClasses[key];
    if (is.string(storedClass)) {
      return storedClass;
    }

    const hash = stableHash(this.name, key);
    this.storedClasses[key] = hash;
    this.storedStyles[hash] = [property, value];

    this.append(genCssRule([parentClassName, hash], property, value));
    return hash;
  }
}
