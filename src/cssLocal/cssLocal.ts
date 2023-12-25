function createSheet(name: string) {
  const id = `css-local-${name}-${genUniqueHash()}`;

  const styleTag = createStyleTag(id);
  let sheet = "";

  const storedStyles: StoredStyles = {};

  function create(styles: Styles) {
    const localStyles = iterateScopedStyles(styles, applyStyle);

    return sheet;
  }

  return {
    create,
  };

  function applyStyle(property: string, value: string): string {
    const key = `${property}:${value}`;

    if (storedStyles[key]) {
      return key;
    }

    appendStyle(property, value);
    storedStyles[key] = [property, value];
    return key;
  }

  function appendStyle(property: string, value: string) {
    const hash = genUniqueHash();
    const propertyName = camelCaseToDash(property);

    const selector = `.${hash}`;

    const rule = `${selector} { ${propertyName}: ${value}; }`;
    sheet += sheet ? `\n${rule}` : rule;
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
