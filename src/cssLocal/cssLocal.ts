function createSheet(name: string) {
  const id = `css-local-${name}-${genUniqueHash()}`;

  const styleTag = createStyleTag(id);
  let sheet = "";

  const storedStyles: StoredStyles = {};
  const storedClasses: Record<string, string> = {};

  function create(styles: Styles) {
    const localStyles = iterateScopedStyles(styles, applyStyle);

    return sheet;
  }

  return {
    create,
  };

  function applyStyle(property: string, value: string): string {
    const key = `${property}:${value}`;

    if (storedClasses[key]) {
      return key;
    }

    const hash = genUniqueHash();
    storedClasses[key] = hash;
    storedStyles[hash] = [property, value];

    const className = `.${hash}`;
    const line = `${className} { ${property}: ${value}; }`;
    sheet += sheet ? `\n${line}` : line;

    return key;
  }
}

function iterateScopedStyles(
  styles: Styles,
  applyStyle: (property: string, value: string) => string
): ScopedStyles {
  const output: ScopedStyles = {};

  for (const scope in styles) {
    let scopeClassName = genUniqueHash();

    output[scope] = new Set<string>();

    const scopedStyles = styles[scope];
    for (const property in scopedStyles) {
      if (isPseudoSelector(property)) {
        const chunk = createChunk(
          scopeClassName,
          property,
          scopedStyles[property as keyof typeof scopedStyles] as StyleObject
        );

        output[scope].add(chunk);

        continue;
      }

      const value = scopedStyles[property as keyof typeof scopedStyles];

      output[scope].add(applyStyle(property, value as string));
    }
  }

  return output;
}

function createChunk(
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

  return `${selector} { ${output} }`;
}

function isPseudoSelector(selector: string) {
  return selector.startsWith(":");
}

type PropertyValue = string | number;
type AllowedStyleProperties = keyof CSSStyleDeclaration;
type StyleObject = Partial<Record<AllowedStyleProperties, PropertyValue>>;
type Pseudo = `:${string}`;
type Style = StyleObject & Record<Pseudo, StyleObject>;
type Styles = Record<string, Style>;
type StoredStyles = Record<string, [property: string, value: string]>;
type ScopedStyles = Record<string, Set<string>>;

function createStyleTag(id: string) {
  const styleTag = document.createElement("style");
  styleTag.type = "text/css";
  document.head.appendChild(styleTag);
  return styleTag;
}

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
