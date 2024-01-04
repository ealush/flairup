export type PropertyValue = string | number;
type CSSProperties = keyof CSSStyleDeclaration;
export type StyleObject = Partial<Record<CSSProperties, PropertyValue>>;
type Pseudo = `:${string}`;
type MediaQuery = `@media ${string}`;

type CSSVariablesObject = Record<`--${string}`, string>;
type Style = Partial<
  Record<string, PropertyValue> & FlairUpProperties & Chunks & StyleObject
>;
export type ParentClass = `.${string}`;
export type ClassSet = Set<string>;

// That's the create function input
export type Styles<K extends string> = Partial<
  Record<K, Style | Record<ParentClass, Record<K, Style>>>
>;
export type StoredStyles = Record<string, [property: string, value: string]>;

// This is the actual type that's returned from each create function
export type ScopedStyles<K extends string> = Record<K, ClassSet>;
export type ClassList = (string | undefined)[];
export {};

type FlairUpProperties = Partial<{
  '.'?: string | string[];
  '--'?: CSSVariablesObject;
}>;
type Chunks = Record<Pseudo | MediaQuery, StyleObject>;
