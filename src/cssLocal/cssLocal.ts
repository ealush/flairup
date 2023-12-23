function createSheet(name: string) {
  const stylesheet = {};
  const id = `css-local-${name}-${count.next()}`;

  const styleTag = createStyleTag(id);

  function create(styles: Styles) {
    Object.assign(stylesheet, styles);

    
  }

  return {
    create,
  };
}

type Style = Record<keyof CSSStyleDeclaration, string>;
type Styles = Record<string, Style>;

function createStyleTag(id: string) {
  const styleTag = document.createElement("style");
  styleTag.type = "text/css";
  document.head.appendChild(styleTag);
  return styleTag;
}

const count = (function counter() {
  let count = 0;
  return {
    next: () => count++,
  };
})();

function camelCaseToDash(str: string) {
  return str.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
}

const takenHashes = new Set<string>();

function generateUniqueRandomClassName() {
  let hash;

  do {
    hash = Math.random().toString(36).substring(2, 15);
  } while (takenHashes.has(hash));

  return `css-local-${hash}`;
}
