function createSheet(name: string) {
  const sheet = new Sheet(name);

  const storedStyles: StoredStyles = {};
  const storedClasses: Record<string, string> = {};

  return {
    create,
  };

  function create<K extends string>(styles: Styles<K>) {
    const localStyles = iterateScopedStyles<K>(styles, applyRule, applyChunk);

    return localStyles;
  }

  function applyRule(property: string, value: string): string {
    const key = `${property}:${value}`;

    if (storedClasses[key]) {
      return key;
    }

    const hash = genUniqueHash();
    storedClasses[key] = hash;
    storedStyles[hash] = [property, value];

    sheet.append(`.${hash} { ${property}: ${value}; }`);
    return hash;
  }

  function applyChunk(
    className: string,
    property: string,
    styleObject: StyleObject
  ) {
    let output = "";
    const selector = `.${className}${property}`;

    for (const property in styleObject) {
      const value = styleObject[property as keyof typeof styleObject];
      const line = `${property}: ${value};`;
      output += output ? `\n${line}` : line;
    }

    sheet.append(`${selector} { ${output} }`);
  }
}

function iterateScopedStyles<K extends string>(
  styles: Styles<K>,
  applyRule: (property: string, value: string) => string,
  applyChunk: (
    className: string,
    property: string,
    styleObject: StyleObject
  ) => void
): ScopedStyles<K> {
  const output: ScopedStyles<K> = {} as ScopedStyles<K>;

  for (const scope in styles) {
    let scopeClassName = genUniqueHash();

    output[scope] = new Set<string>();

    const scopedStyles = styles[scope];
    for (const property in scopedStyles) {
      if (isPseudoSelector(property)) {
        applyChunk(
          scopeClassName,
          property,
          scopedStyles[property as keyof typeof scopedStyles] as StyleObject
        );

        output[scope].add(scopeClassName);

        continue;
      }

      const value = scopedStyles[property as keyof typeof scopedStyles];

      output[scope].add(applyRule(property, value as string));
    }
  }

  return output;
}

function isPseudoSelector(selector: string) {
  return selector.startsWith(":");
}

class Sheet {
  private styleTag: HTMLStyleElement | undefined;

  constructor(private name: string) {
    const id = `css-local-${name}-${genUniqueHash()}`;

    this.styleTag = this.createStyleTag(id);
  }

  append(css: string) {
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

function camelCaseToDash(str: string) {
  return str.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
}

const takenHashes = new Set<string>();

function genUniqueHash() {
  let hash;

  do {
    hash = Math.random().toString(36).substring(2, 15);
  } while (takenHashes.has(hash));

  return `css-local-${hash}`;
}

function join(style: ClassSet): string {
  let output = "";

  for (const className of style) {
    output += output ? ` ${className}` : className;
  }

  return output;
}
