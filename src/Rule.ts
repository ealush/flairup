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
    this.joined = joinedProperty(property, value);
    const joinedConditions = this.selector.preconditions.concat(
      this.selector.postconditions,
    );
    this.key = joinTruthy([this.joined, joinedConditions]);
    this.hash = stableHash(this.sheet.name, this.joined + joinedConditions);
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

  constructor(
    private sheet: Sheet,
    scopeName: string | null = null,
    {
      preconditions,
      postconditions,
    }: {
      preconditions?: string[] | string | undefined;
      postconditions?: string[] | string | undefined;
    } = {},
  ) {
    this.preconditions = preconditions ? asArray(preconditions) : [];
    this.postconditions = postconditions ? asArray(postconditions) : [];
    this.setScope(scopeName);
  }

  private setScope(scopeName: string | null): Selector {
    if (!scopeName) {
      return this;
    }

    if (!this.scopeClassName) {
      this.scopeName = scopeName;
      this.scopeClassName = stableHash(this.sheet.name, scopeName);
    }

    return this;
  }

  addScope(scopeName: string): Selector {
    return new Selector(this.sheet, scopeName, {
      preconditions: this.preconditions,
      postconditions: this.postconditions,
    });
  }

  addPrecondition(precondition: string): Selector {
    return new Selector(this.sheet, this.scopeClassName, {
      postconditions: this.postconditions,
      preconditions: this.preconditions.concat(precondition),
    });
  }

  addPostcondition(postcondition: string): Selector {
    return new Selector(this.sheet, this.scopeClassName, {
      preconditions: this.preconditions,
      postconditions: this.postconditions.concat(postcondition),
    });
  }

  createRule(property: string, value: string): Rule {
    return new Rule(this.sheet, property, value, this);
  }
}
