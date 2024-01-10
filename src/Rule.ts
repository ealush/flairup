import { Sheet } from './Sheet';
import { asArray } from './utils/asArray';
import { joinTruthy } from './utils/joinTruthy';
import { stableHash } from './utils/stableHash';
import {
  camelCaseToDash,
  handlePropertyValue,
  joinSelectors,
  joinedProperty,
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
    this.key = joinTruthy([
      this.joined,
      joinSelectors(this.selector.preconditions),
      this.selector.pseudoSelector,
      joinSelectors(this.selector.postconditions),
    ]);
    this.hash = stableHash(
      this.sheet.name,
      this.joined +
        joinTruthy(this.selector.preconditions) +
        (this.selector.pseudoSelector
          ? (this.selector.pseudoSelector as string)
          : '') +
        joinTruthy(this.selector.postconditions),
    );
  }

  public toString(): string {
    let selectors = joinTruthy([
      joinSelectors(this.selector.preconditions.concat(this.hash)),
      this.selector.pseudoSelector,
    ]);
    const post = joinTruthy(this.selector.postconditions, ' ');
    selectors += post ? ` ${post}` : '';

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

export class Selector {
  public preconditions: string[] = [];
  public pseudoSelector: string | undefined;
  public scopeClassName: string;
  public postconditions: string[] = [];

  constructor(
    private sheet: Sheet,
    public scopeName: string,
    {
      pseudoSelector,
      preconditions,
      postconditions,
    }: {
      pseudoSelector?: string | undefined;
      preconditions?: string[] | string | undefined;
      postconditions?: string[] | string | undefined;
    } = {},
  ) {
    this.pseudoSelector = pseudoSelector;
    this.preconditions = preconditions ? asArray(preconditions) : [];
    this.postconditions = postconditions ? asArray(postconditions) : [];
    this.scopeClassName = scopeName;
  }

  addPseudoSelector(pseudoSelector: string): Selector {
    return new Selector(this.sheet, this.scopeClassName, {
      pseudoSelector,
      preconditions: this.preconditions,
    });
  }

  addPrecondition(precondition: string): Selector {
    return new Selector(this.sheet, this.scopeClassName, {
      pseudoSelector: this.pseudoSelector,
      preconditions: this.preconditions.concat(precondition),
    });
  }

  addPostcondition(postcondition: string): Selector {
    return new Selector(this.sheet, this.scopeClassName, {
      pseudoSelector: this.pseudoSelector,
      preconditions: this.preconditions,
      postconditions: this.postconditions.concat(postcondition),
    });
  }

  createRule(property: string, value: string): Rule {
    return new Rule(this.sheet, property, value, this);
  }
}
