function createSheet(name: string) {
  const id = `css-local-${name}-${genUniqueHash()}`;

  const styleTag = createStyleTag(id);

  const storedStyles: StoredStyles = {};
  const hashedStyles: HasedStyles = {};

  function create(styles: Styles) {
    const localStyles = iterateScopedStyles(styles, applyStyle);

    return localStyles;
  }

  return {
    create,
  };

  function applyStyle(property: string, value: string): string {
    const key = `${property}:${value}`;

    if (storedStyles[key]) {
      return key;
    }

    const hash = genUniqueHash();
    hashedStyles[hash] = key;
    storedStyles[key] = [property, value];
    return key;
  }
}

function iterateScopedStyles(
  styles: Styles,
  applyStyle: (property: string, value: string) => string
): ScopedStyles {
  const output: ScopedStyles = {};

  for (const scope in styles) {
    output[scope] = new Set<string>();

    const scopedStyles = styles[scope];
    for (const property in scopedStyles) {
      const value = scopedStyles[property];

      output[scope].add(applyStyle(property, value));
    }
  }

  return output;
}

type Style = Record<keyof CSSStyleDeclaration, string>;
type Styles = Record<string, Style>;
type StoredStyles = Record<string, [property: string, value: string]>;
type HasedStyles = Record<string, string>;
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
