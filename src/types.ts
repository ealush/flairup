export type StyleObject = Partial<CSSStyleDeclaration>;
type Pseudo = `:${string}`;
type MediaQuery = `@media ${string}`;

export type CSSVariablesObject = Record<`--${string}`, string>;

export type ParentClass = `.${string}`;
export type ClassSet = Set<string>;

// That's the create function input
export type Styles = Partial<StyleObject & FlairUpProperties & Chunks>;
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

export type CreateSheetInput<K extends string> =
  | Record<K, Styles>
  | Record<ParentClass, Record<K, Styles>>;
