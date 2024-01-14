export type StyleObject = Partial<CSSStyleDeclaration>;
type Pseudo = `:${string}`;
type MediaQuery = `@media ${string}`;
export type ClassName = `.${string}`;
export type CSSVariablesObject = Record<`--${string}`, string>;

type ConditionPrefix = '.' | ':' | '~' | '+' | '*' | '>' | '&.' | '&:';
type PreConditionKey = `${ConditionPrefix}${string}`;
type PostCondition = `${ConditionPrefix}${string}`;

export type ClassSet = Set<string>;

// That's the create function input
export type Styles = Partial<
  StyleObject & FlairUpProperties & Chunks & PostConditionStyles
>;

type PostConditionStyles = {
  [k: PostCondition]:
    | StyleObject
    | FlairUpProperties
    | Chunks
    | PostConditionStyles;
};
export type StoredStyles = Record<string, [property: string, value: string]>;

// This is the actual type that's returned from each create function
export type ScopedStyles<K extends string = string> = Record<S<K>, ClassSet>;
export type ClassList = (string | undefined)[];
export {};

export type DirectClass = string | string[];

type FlairUpProperties = Partial<{
  '.'?: DirectClass;
  '--'?: CSSVariablesObject;
}>;
type Chunks = {
  [k: MediaQuery]:
    | StyleObject
    | Record<'--', CSSVariablesObject>
    | PostConditionStyles;
} & { [k: Pseudo]: StyleObject };

export type CreateSheetInput<K extends string> = Partial<
  { [k in K]: Styles } | PreConditions<K>
>;

export type PreConditions<K extends string> = {
  [k: PreConditionKey]:
    | {
        [k in K]: Styles;
      }
    | PreConditions<K>;
};

type S<K extends string> = Exclude<
  K,
  PreConditionKey | '--' | '.' | keyof CSSStyleDeclaration | Pseudo | MediaQuery
>;

export type createSheetReturn = {
  create: <K extends string>(
    styles: CreateSheetInput<K>,
  ) => ScopedStyles<S<K>> & ScopedStyles<string>;
  getStyle: () => string;
  isApplied: () => boolean;
};
