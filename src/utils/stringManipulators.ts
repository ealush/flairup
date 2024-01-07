import { ClassList, PropertyValue } from '../types.js';
import { is } from './is.js';

// Convets property name and value to css line
export function genLine(property: string, value: PropertyValue): string {
  return `${camelCaseToDash(property)}: ${handlePropertyValue(
    property,
    value,
  )};`;
}

// Some properties need special handling
export function handlePropertyValue(
  property: string,
  value: PropertyValue,
): string | number {
  if (property === 'content') {
    return `"${value}"`;
  }

  return value;
}

export function wrapWithCurlys(content: string, breakLine = false): string {
  return [breakLine ? '{\n' : '{', content, breakLine ? '\n}' : '}'].join('');
}

export function camelCaseToDash(str: string): string {
  return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

export function joinedProperty(property: string, value: string): string {
  return `${property}:${value}`;
}

// Creates the css line for a chunk
export function chunkSelector(className: ClassList, property: string): string {
  const base = joinSelectors(className);

  if (is.pseudoSelector(property, null)) {
    return `${base}${property}`;
  }

  if (is.mediaQuery(property, null)) {
    return `${property}`;
  }

  return base;
}

export function joinSelectors(classes: ClassList): string {
  return classes
    .filter(Boolean)
    .map((c) => `.${c}`)
    .join(' ');
}

export function appendString(base: string, line: string): string {
  return base ? `${base}\n${line}` : line;
}
