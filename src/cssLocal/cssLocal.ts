function createSheet(name: string) {
  const sheet = new Sheet(name);

  const storedStyles: StoredStyles = {};
  const storedClasses: Record<string, string> = {};

  function create(styles: Styles) {
    const localStyles = iterateScopedStyles(styles, applyRule, applyChunk);

    return sheet;
  }

  return {
    create,
  };

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

function iterateScopedStyles(
  styles: Styles,
  applyRule: (property: string, value: string) => string,
  applyChunk: (
    className: string,
    property: string,
    styleObject: StyleObject
  ) => void
): ScopedStyles {
  const output: ScopedStyles = {};

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
    if (!this.styleTag) {
      return;
    }

    this.styleTag.innerHTML += this.styleTag.innerHTML ? `\n${css}` : css;
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
type Styles = Record<string, Style>;
type StoredStyles = Record<string, [property: string, value: string]>;
type ScopedStyles = Record<string, Set<string>>;

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
