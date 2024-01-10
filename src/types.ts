export type StyleObject = Partial<CSSStyleDeclaration>;
type Pseudo = `:${string}`;
type MediaQuery = `@media ${string}`;

export type CSSVariablesObject = Record<`--${string}`, string>;

type PreCondition = `.${string}`;

export type ClassSet = Set<string>;

// That's the create function input
export type Styles = Partial<StyleObject & FlairUpProperties & Chunks>;
export type StoredStyles = Record<string, [property: string, value: string]>;

// This is the actual type that's returned from each create function
export type ScopedStyles<K extends string = string> = Record<S<K>, ClassSet>;
export type ClassList = (string | undefined)[];
export {};

type FlairUpProperties = Partial<{
  '.'?: string | string[];
  '--'?: CSSVariablesObject;
}>;
type Chunks = Record<
  MediaQuery,
  StyleObject | Record<'--', CSSVariablesObject>
> &
  Record<Pseudo, StyleObject>;

export type CreateSheetInput<K extends string> = Partial<
  Record<K, Styles> | Record<PreCondition, Record<K, Styles>>
>;

type S<K extends string> = Exclude<
  K,
  PreCondition | '--' | '.' | keyof CSSStyleDeclaration | Pseudo | MediaQuery
>;

export type createSheetReturn = {
  create: <K extends string>(
    styles: CreateSheetInput<K>,
  ) => ScopedStyles<S<K>> & ScopedStyles<string>;
  getStyle: () => string;
  isApplied: () => boolean;
};
