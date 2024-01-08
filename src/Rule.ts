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
  public hash: string = '';
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
      this.selector.addPseudoSelector,
    ]);
  }

  public toString(): string {
    this.hash = stableHash(
      this.sheet.name,
      this.joined + joinTruthy(this.selector.preconditions),
    );
    const selectors = joinTruthy([
      joinSelectors(this.selector.preconditions.concat(this.hash)),
      this.selector.pseudoSelector,
    ]);

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

  constructor(
    private sheet: Sheet,
    public scopeName: string,
    {
      pseudoSelector,
      preconditions,
    }: {
      pseudoSelector?: string | undefined;
      preconditions?: string[] | string | undefined;
    } = {},
  ) {
    this.pseudoSelector = pseudoSelector;
    this.preconditions = preconditions ? asArray(preconditions) : [];
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

  createRule(property: string, value: string): Rule {
    return new Rule(this.sheet, property, value, this);
  }
}
