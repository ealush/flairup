import { Sheet } from './Sheet';
import { asArray } from './utils/asArray';
import { joinTruthy } from './utils/joinTruthy';
import { stableHash } from './utils/stableHash';
import { joinSelectors, joinedProperty } from './utils/stringManipulators';

export class Rule {
  private preconditions: string[] = [];
  private pseudoSelector?: string | undefined;
  public hash: string = '';
  public joined: string;
  public key: string;

  constructor(
    private sheet: Sheet,
    public property: string,
    public value: string,
    {
      pseudoSelector,
      preconditions,
    }: {
      pseudoSelector?: string | undefined;
      preconditions?: string[] | string | undefined;
    } = {},
  ) {
    this.property = property;
    this.value = value;
    this.pseudoSelector = pseudoSelector;
    this.preconditions = preconditions ? asArray(preconditions) : [];
    this.joined = joinedProperty(property, value);
    this.key = joinTruthy([
      this.joined,
      joinSelectors(this.preconditions),
      this.pseudoSelector,
    ]);
  }

  public toString(): string {
    this.hash = stableHash(
      this.sheet.name,
      this.joined + joinTruthy(this.preconditions),
    );
    const selectors = joinTruthy([
      joinSelectors(this.preconditions.concat(this.hash)),
      this.pseudoSelector,
    ]);

    return `${selectors} {${joinedProperty(this.property, this.value)};}`;
  }
}

export class Selector {
  private preconditions: string[] = [];
  private pseudoSelector: string | undefined;

  constructor(
    private sheet: Sheet,
    {
      pseudoSelector,
      preconditions,
    }: {
      pseudoSelector?: string;
      preconditions?: string[] | string | undefined;
    } = {},
  ) {
    this.pseudoSelector = pseudoSelector;
    this.preconditions = preconditions ? asArray(preconditions) : [];
  }

  for(property: string, value: string): Rule {
    return new Rule(this.sheet, property, value, {
      pseudoSelector: this.pseudoSelector,
      preconditions: this.preconditions,
    });
  }
}
