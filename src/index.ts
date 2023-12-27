export function createSheet(name: string) {
  const sheet = new Sheet(name);

  return {
    create,
  };

  function create<K extends string>(styles: Styles<K>) {
    const localStyles = iterateScopedStyles<K>(name, styles, sheet);

    return localStyles;
  }
}

function genLine(property: string, value: PropertyValue) {
  return `${camelCaseToDash(property)}: ${handlePropertyValue(
    property,
    value
  )};`;
}

function iterateScopedStyles<K extends string>(
  name: string,
  styles: Styles<K>,
  sheet: Sheet
): ScopedStyles<K> {
  const output: ScopedStyles<K> = {} as ScopedStyles<K>;

  for (const scope in styles) {
    let scopeClassName = genUniqueHash(name);

    output[scope] = new Set<string>();

    const scopedStyles = styles[scope];
    for (const property in scopedStyles) {
      if (is.pseudoSelector(property)) {
        sheet.applyChunk(
          scopeClassName,
          property,
          scopedStyles[property as keyof typeof scopedStyles] as StyleObject
        );

        output[scope].add(scopeClassName);

        continue;
      }

      const value = scopedStyles[property as keyof typeof scopedStyles];
      const ruleClassName = sheet.applyRule(property, value as string);

      output[scope].add(ruleClassName);
    }
  }

  return output;
}

const is = {
  pseudoSelector: (selector: string) => selector.startsWith(":"),
  mediaQuery: (property: string) => property.startsWith("@media"),
};

class Sheet {
  private styleTag: HTMLStyleElement | undefined;
  private storedStyles: StoredStyles = {};
  private storedClasses: Record<string, string> = {};

  constructor(private name: string) {
    const id = `cl-${name}-${genUniqueHash(name)}`;

    this.styleTag = this.createStyleTag(id);
  }

  private append(css: string) {
    this.styleTag?.sheet?.insertRule(css);
  }

  createStyleTag(id: string) {
    // check that we're in the browser and have access to the DOM
    if (typeof document === "undefined") {
      return;
    }

    const styleTag = document.createElement("style");
    styleTag.type = "text/css";
    document.head.appendChild(styleTag);
    return styleTag;
  }

  applyRule(property: string, value: string) {
    const key = `${property}:${value}`;

    if (this.storedClasses[key]) {
      return key;
    }

    const hash = genUniqueHash(this.name);
    this.storedClasses[key] = hash;
    this.storedStyles[hash] = [property, value];

    this.append(`.${hash} { ${genLine(property, value)}; }`);
    return hash;
  }

  applyChunk(className: string, property: string, styleObject: StyleObject) {
    let output = "";
    const selector = `.${className}${property}`;

    for (const property in styleObject) {
      const value = styleObject[
        property as keyof typeof styleObject
      ] as PropertyValue;
      const line = genLine(property, value);
      output += output ? `\n${line}` : line;
    }

    this.append(`${selector} { ${output} }`);
  }
}

function camelCaseToDash(str: string) {
  return str.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
}

function handlePropertyValue(property: string, value: PropertyValue) {
  if (typeof value === "number") {
    return `${value}px`;
  }

  if (property === "content") {
    return `"${value}"`;
  }

  return value;
}

const takenHashes = new Set<string>();

function genUniqueHash(prefix: string) {
  let hash;

  do {
    hash = Math.random().toString(36).substring(2, 15);
  } while (takenHashes.has(hash));

  return `${prefix ?? "cl"}_${hash}`;
}

export function xJoin(...styles: ClassSet[]): string {
  return styles.reduce((acc, curr) => {
    return `${acc} ${Array.from(curr).join(" ")}`;
  }, "");
}

type PropertyValue = string | number;
type AllowedStyleProperties = keyof CSSStyleDeclaration;
type StyleObject = Partial<Record<AllowedStyleProperties, PropertyValue>>;
type Pseudo = `:${string}`;
type Style = StyleObject & Record<Pseudo, StyleObject>;
type Styles<K extends string> = Record<K, Style>;
type StoredStyles = Record<string, [property: string, value: string]>;
type ScopedStyles<K extends string> = Record<K, ClassSet>;
type ClassSet = Set<string>;
