import { ClassName } from '../types.js';

export function isPsuedoSelector(selector: string): boolean {
  return selector.startsWith(':');
}

export function isStyleCondition(selector: string): boolean {
  return (
    isString(selector) &&
    (selector === '*' ||
      (selector.length > 1 && ':>~.+*'.includes(selector.slice(0, 1))) ||
      isImmediatePostcondition(selector))
  );
}

export function isValidProperty(
  property: string,
  value: unknown,
): value is string {
  return (
    (isString(value) || typeof value === 'number') &&
    !isCssVariables(property) &&
    !isPsuedoSelector(property) &&
    !isMediaQuery(property)
  );
}

export function isMediaQuery(selector: string): boolean {
  return selector.startsWith('@media');
}

export function isDirectClass(selector: string): boolean {
  return selector === '.';
}

export function isCssVariables(selector: string): boolean {
  return selector === '--';
}

export function isString(value: unknown): value is string {
  return value + '' === value;
}

export function isClassName(value: unknown): value is ClassName {
  return isString(value) && value.length > 1 && value.startsWith('.');
}

export function isImmediatePostcondition(
  value: unknown,
): value is `&${string}` {
  return isString(value) && (value.startsWith('&') || isPsuedoSelector(value));
}
