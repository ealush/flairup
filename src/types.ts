export type PropertyValue = string | number;
type CSSProperties = keyof CSSStyleDeclaration;
export type StyleObject = Partial<Record<CSSProperties, PropertyValue>>;
type Pseudo = `:${string}`;
type MediaQuery = `@media ${string}`;
type CSSVariablesObject = Record<`--${string}`, string>;
type Style = Partial<
  Record<string, any> &
    Partial<{
      '.'?: string | string[];
      '--'?: CSSVariablesObject;
    }> &
    Record<Pseudo | MediaQuery, StyleObject> &
    StyleObject
>;
export type ParentClass = `.${string}`;
export type ClassSet = Set<string>;
export type Styles<K extends string> = Partial<
  Record<K, Style | Record<ParentClass, Record<K, Style>>>
>;
export type StoredStyles = Record<string, [property: string, value: string]>;
export type ScopedStyles<K extends string> = Record<K, ClassSet>;
export type ClassList = (string | undefined)[];
export {};
