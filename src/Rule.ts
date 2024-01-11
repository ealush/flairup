import { Sheet } from './Sheet';
import { asArray } from './utils/asArray';
import { IS } from './utils/is';
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
    const joinedConditions = this.selector.preconditions.concat(
      this.selector.postconditions,
    );
    this.key = joinTruthy([this.joined, joinedConditions]);
    this.hash = stableHash(this.sheet.name, this.joined + joinedConditions);
  }

  public toString(): string {
    let selectors = joinSelectors(
      this.selector.preconditions.concat(this.hash),
    );

    selectors = this.selector.postconditions.reduce(
      (selectors, current) =>
        IS.immediatePostcondition(current)
          ? selectors + current
          : `${selectors} ${current}`,
      selectors,
    );

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
  public scopeClassName: string;
  public postconditions: string[] = [];

  constructor(
    private sheet: Sheet,
    public scopeName: string,
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
    this.scopeClassName = scopeName;
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
