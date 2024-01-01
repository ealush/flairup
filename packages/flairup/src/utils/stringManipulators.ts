import { ClassList, PropertyValue } from '../types';
import { is } from './is';

export function genCssRule(
  classes: ClassList,
  property: string,
  value: string,
): string {
  return genCssRules(classes, genLine(property, value));
}

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

export function genCssRules(classes: ClassList, content: string): string {
  return `${makeClassName(classes)} ${wrapWithCurlys(content)}`;
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
  const base = makeClassName(className);

  if (is.pseudoSelector(property)) {
    return `${base}${property}`;
  }

  if (is.mediaQuery(property)) {
    return `${property}`;
  }

  return base;
}

export function makeClassName(classes: ClassList): string {
  return classes
    .filter(Boolean)
    .map((c) => `.${c}`)
    .join(' ');
}

export function appendString(base: string, line: string): string {
  return base ? `${base}\n${line}` : line;
}
