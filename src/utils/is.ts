import { CSSVariablesObject, StyleObject, Styles } from '../types.js';

// Selectors
export const is = {
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
    !is.cssVariables(property, value) &&
    !is.pseudoSelector(property, value) &&
    !is.mediaQuery(property, value),
  className: (property: string, _: unknown): _ is StyleObject =>
    property.startsWith('.') && property.length > 1,
  string: (value: unknown): value is string => typeof value === 'string',
};
