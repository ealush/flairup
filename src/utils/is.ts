import { CSSVariablesObject, StyleObject, Styles } from '../types.js';

// Selectors
export const IS = {
  pseudoSelector: (selector: string, _: unknown): _ is StyleObject =>
    selector.startsWith(':'),
  mediaQuery: (property: string, _: unknown): _ is Styles =>
    property.startsWith('@media'),
  directClass: (property: string, _: unknown): _ is string | string[] =>
    property === '.',
  cssVariables: (property: string, _: unknown): _ is CSSVariablesObject =>
    property === '--',
  validProperty: (property: string, value: unknown): value is string =>
    (typeof value === 'string' || typeof value === 'number') &&
    !IS.cssVariables(property, value) &&
    !IS.pseudoSelector(property, value) &&
    !IS.mediaQuery(property, value),
  className: (property: string, _: unknown): _ is StyleObject =>
    property.startsWith('.') && property.length > 1,
  string: (value: unknown): value is string => typeof value === 'string',
  postcondition: (value: unknown): value is string =>
    IS.string(value) &&
    (value === '*' ||
      (value.length > 1 && ':>~.+*'.includes(value.slice(0, 1)))),
};
