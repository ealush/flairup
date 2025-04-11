export type StyleObject = Partial<CSSStyleDeclaration>;
type Pseudo = `:${string}`;
type MediaQuery = `@media ${string}`;
export type ClassName = `.${string}`;
export type CSSVariablesObject = Record<`--${string}`, string>;

type ConditionPrefix = '.' | ':' | '~' | '+' | '*' | '>' | '&.' | '&:';
type ConditionKey = `${ConditionPrefix}${string}`;

export type ClassSet = Set<string>;

// That's the create function input
export type Styles = Partial<StyleObject & Chunks & PostConditionStyles>;

export type PostConditionStyles = {
  [k: ConditionKey]:
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
  { [k in K]: Styles | FlairUpProperties } | PreConditions<K>
>;

export type PreConditions<K extends string> = {
  [k: ConditionKey]:
    | {
        [k in K]: Styles;
      }
    | PreConditions<K>;
};

type S<K extends string> = Exclude<
  K,
  ConditionKey | '--' | '.' | keyof CSSStyleDeclaration | Pseudo | MediaQuery
>;

export type createSheetReturn = {
  create: <K extends string>(
    styles: CreateSheetInput<K>,
  ) => ScopedStyles<S<K>> & ScopedStyles<string>;
  keyframes: KeyframesFunction;
  getStyle: () => string;
  isApplied: () => boolean;
};

export type KeyframeStages = {
  [stage: string]: StyleObject;
};

export type keyframesInput<KF extends string> = Record<KF, KeyframeStages>;

export type KeyframesFunction = <KF extends string>(
  keyframesInput: keyframesInput<KF>,
) => Record<KF, string>;

export type KeyframesOutput<KF extends string> = Record<KF, string>;
