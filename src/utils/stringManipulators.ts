import { ClassList } from '../types.js';

// Some properties need special handling
export function handlePropertyValue(property: string, value: string): string {
  if (property === 'content') {
    return `"${value}"`;
  }

  return value;
}

export function camelCaseToDash(str: string): string {
  return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

export function joinedProperty(property: string, value: string): string {
  return `${property}:${value}`;
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
