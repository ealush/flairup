function createSheet(name: string) {
  const id = `css-local-${name}-${genUniqueHash()}`;

  const styleTag = createStyleTag(id);

  const storedStyles = {};
  const hashedStyles = {};

  function create(styles: Styles) {
    iterateScopedStyles(styles, storedStyles, hashedStyles);
  }

  return {
    create,
  };
}

function iterateScopedStyles(
  styles: Styles,
  storedStyles: StoredStyles,
  hasedStyles: hasedStyles
) {
  for (const scope in styles) {
    const scopedStyles = styles[scope];
    for (const property in scopedStyles) {
      const value = scopedStyles[property];

      const key = `${property}:${value}`;

      if (storedStyles[key]) {
        continue;
      }
      const hash = genUniqueHash();

      hasedStyles[hash] = key;
      storedStyles[key] = [property, value];
    }
  }
}

type Style = Record<keyof CSSStyleDeclaration, string>;
type Styles = Record<string, Style>;
type StoredStyles = Record<string, [property: string, value: string]>;
type hasedStyles = Record<string, string>;

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
