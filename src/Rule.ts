import { coveredProperties } from './shorthands.js';
import { Sheet } from './Sheet';
import { asArray } from './utils/asArray';
import { isImmediatePostcondition, isPsuedoSelector } from './utils/is';
import { joinTruthy } from './utils/joinTruthy';
import { stableHash } from './utils/stableHash';
import {
  camelCaseToDash,
  handlePropertyValue,
  joinedProperty,
  toClass,
} from './utils/stringManipulators';

export function toCssIdent(value: string): string {
  const cleaned = value.replace(/[^a-zA-Z0-9_-]/g, '_');
  if (/^[0-9]/.test(cleaned) || /^-[0-9]/.test(cleaned)) {
    return `_${cleaned}`;
  }
  return cleaned;
}

export class Rule {
  public hash: string;
  public joined: string;
  public key: string;

  constructor(
    private sheet: Sheet,
    public property: string,
    public value: string,
    private selector: Selector,
  ) {
    this.property = property;
    this.value = value;
    // Dash-case the property before hashing so spellings like
    // backgroundColor/background-color share one deduplication entry.
    this.joined = joinedProperty(camelCaseToDash(property), value);
    const conds = this.selector.preconditions
      .concat(this.selector.postconditions)
      .join(',');
    const atKey = this.selector.atRules.join('|');
    const scopePart = this.selector.hasConditions
      ? (this.selector.scopeClassName as string)
      : '';
    this.key = [this.joined, conds, atKey, scopePart].join('\0');
    this.hash = this.buildHash(atKey);
  }

  public getConflictKeys(): string[] {
    const pre = this.selector.preconditions.join(',');
    const post = this.selector.postconditions.join(',');
    const at = this.selector.atRules.join('|');
    return coveredProperties(camelCaseToDash(this.property)).map((prop) =>
      [prop, pre, post, at].join('\0'),
    );
  }

  private buildHash(atKey: string): string {
    // The prefix is sanitized so every sheet name yields valid CSS classes;
    // toCssIdent is the identity for ordinary names, keeping their hashes
    // byte-stable.
    if (!this.selector.hasConditions && !atKey) {
      return stableHash(toCssIdent(this.sheet.name), this.joined);
    }

    return stableHash(toCssIdent(this.sheet.name), this.key);
  }

  public toString(): string {
    let selectors = mergeSelectors(this.selector.preconditions, {
      right: this.hash,
    });

    selectors = mergeSelectors(this.selector.postconditions, {
      left: selectors,
    });

    return `${selectors} {${Rule.genRule(this.property, this.value)}}`;
  }

  static genRule(property: string, value: string): string {
    const transformedProperty = camelCaseToDash(property);
    return (
      joinedProperty(
        transformedProperty,
        handlePropertyValue(property, value),
      ) + ';'
    );
  }
}

export function mergeSelectors(
  selectors: string[],
  { left = '', right = '' }: { left?: string; right?: string } = {},
): string {
  const output = selectors.reduce((selectors, current) => {
    if (isPsuedoSelector(current)) {
      return selectors + current;
    }

    if (isImmediatePostcondition(current)) {
      return selectors + current.slice(1);
    }

    return joinTruthy([selectors, current], ' ');

    // selector then postcondition
  }, left);

  // preconditions, then selector
  return joinTruthy([output, toClass(right)], ' ');
}

export class Selector {
  public preconditions: string[] = [];
  public scopeClassName: string | null = null;
  public scopeName: string | null = null;
  public postconditions: string[] = [];
  public atRules: string[] = [];

  constructor(
    private sheet: Sheet,
    scopeName: string | null = null,
    {
      preconditions,
      postconditions,
      atRules,
    }: {
      preconditions?: string[] | string | undefined;
      postconditions?: string[] | string | undefined;
      atRules?: string[] | undefined;
    } = {},
  ) {
    this.preconditions = preconditions ? asArray(preconditions) : [];
    this.postconditions = postconditions ? asArray(postconditions) : [];
    this.atRules = atRules ? atRules.slice() : [];
    this.setScope(scopeName);
  }

  private setScope(scopeName: string | null): Selector {
    if (!scopeName) {
      return this;
    }

    if (!this.scopeClassName) {
      this.scopeName = scopeName;
      this.scopeClassName = stableHash(
        toCssIdent(this.sheet.name),
        // adding the count guarantees uniqueness across style.create calls
        scopeName + '\0' + this.sheet.count,
      );
    }

    return this;
  }

  get hasConditions(): boolean {
    return this.preconditions.length > 0 || this.postconditions.length > 0;
  }

  addScope(scopeName: string): Selector {
    return new Selector(this.sheet, scopeName, {
      preconditions: this.preconditions,
      postconditions: this.postconditions,
      atRules: this.atRules,
    });
  }

  addPrecondition(precondition: string): Selector {
    return new Selector(this.sheet, this.scopeClassName, {
      postconditions: this.postconditions,
      preconditions: this.preconditions.concat(precondition),
      atRules: this.atRules,
    });
  }

  addPostcondition(postcondition: string): Selector {
    return new Selector(this.sheet, this.scopeClassName, {
      preconditions: this.preconditions,
      postconditions: this.postconditions.concat(postcondition),
      atRules: this.atRules,
    });
  }

  addAtRule(atRule: string): Selector {
    const selector = new Selector(this.sheet, null, {
      preconditions: this.preconditions,
      postconditions: this.postconditions,
      atRules: this.atRules.concat(atRule),
    });
    selector.scopeClassName = this.scopeClassName;
    selector.scopeName = this.scopeName;
    return selector;
  }

  createRule(property: string, value: string): Rule {
    return new Rule(this.sheet, property, value, this);
  }
}
