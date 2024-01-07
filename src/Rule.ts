import { Sheet } from './Sheet';
import { stableHash } from './utils/stableHash';
import { joinSelectors, joinedProperty } from './utils/stringManipulators';

export class Rule {
  private preconditions: string[] = [];
  private property: string;
  private value: string;
  private pseudoSelector: string | undefined;
  private hash: string;

  constructor(
    property: string,
    value: string,
    sheet: Sheet,
    {
      pseudoSelector,
      preconditions,
    }: {
      pseudoSelector?: string;
      preconditions?: string[];
    } = {},
  ) {
    this.property = property;
    this.value = value;
    this.pseudoSelector = pseudoSelector;
    this.preconditions = preconditions ?? [];
    this.hash = stableHash(sheet.name, joinedProperty(property, value));
  }

  public toString(): string {
    const selectors =
      joinSelectors(this.preconditions.concat(this.hash)) +
        this.pseudoSelector ?? '';

    return `${selectors} {${joinedProperty(this.property, this.value)}}`;
  }
}
