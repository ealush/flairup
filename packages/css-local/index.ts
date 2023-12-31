export function cx(...styles: ClassSet[]): string {
  return styles.reduce((acc, curr) => {
    return `${acc} ${Array.from(curr).join(" ")}`;
  }, "");
}

export function createSheet(name: string) {
  const sheet = new Sheet(name);

  return {
    create,
    getStyle: sheet.getStyle.bind(sheet),
  };

  function create<K extends string>(styles: Styles<K>) {
    const scopedStyles: ScopedStyles<K> = {} as ScopedStyles<K>;

    forIn(styles, (scopeName, styles) => {
      const scopeClassName = genUniqueHash(sheet.name, scopeName);
      scopedStyles[scopeName] = iterateStyles(sheet, styles, scopeClassName);
    });

    sheet.apply();

    return scopedStyles;
  }
}

function iterateStyles<K extends string>(
  sheet: Sheet,
  styles: Styles<K>,
  scopeClassName: string
) {
  const output: ClassSet = new Set<string>();
  forIn(styles, (property, value) => {
    if (is.cssVariables(property, value)) {
      return handleCssVariables(sheet, value, property, scopeClassName).forEach(
        (classes) => output.add(classes)
      );
    }
    if (is.directClass(property)) {
      return handleDirectClass(sheet, value).forEach((classes) =>
        output.add(classes)
      );
    }
    if (is.pseudoSelector(property) || is.mediaQuery(property)) {
      return handlePseudoSelectorOrMediaQuery(
        sheet,
        value,
        property,
        scopeClassName
      ).forEach((classes) => output.add(classes));
    }

    if (is.validProperty(value)) {
      const ruleClassName = sheet.addRule(property, value);
      return output.add(ruleClassName);
    }
  });

  return output;
}

function handleDirectClass(sheet: Sheet, classes: string | string[]) {
  return [].concat(classes as unknown as []);
}

function handlePseudoSelectorOrMediaQuery(
  sheet: Sheet,
  styles: StyleObject,
  property: string,
  scopeClassName: string
) {
  const classes: ClassSet = new Set<string>();

  let chunkRows: string[] = [];
  forIn(styles, (property: string, value) => {
    if (is.validProperty(value)) {
      chunkRows.push(genLine(property, value));
      return;
    }

    iterateStyles(sheet, value, scopeClassName).forEach((className) =>
      classes.add(className)
    );
  });

  if (chunkRows.length) {
    const output = chunkRows.join("\n");
    sheet.append(
      `${chunkSelector(scopeClassName, property)} {${
        is.mediaQuery(property) ? genCssRules(scopeClassName, output) : output
      }}`
    );
  }

  classes.add(scopeClassName);
  return classes;
}

function handleCssVariables(
  sheet: Sheet,
  value: CSSVariablesObject,
  _: string,
  scopeClassName: string
) {
  let chunkRows: string[] = [];
  forIn(value, (property: string, value) => {
    chunkRows.push(genLine(property, value));
  });

  if (chunkRows.length) {
    sheet.append(
      `${makeClassName(scopeClassName)} {\n${chunkRows.join("\n")}\n}`
    );
  }

  return [scopeClassName];
}

// Selectors
const is = {
  pseudoSelector: (selector: string) => selector.startsWith(":"),
  mediaQuery: (property: string) => property.startsWith("@media"),
  directClass: (property: string) => property === ".",
  cssVariables: (property: string, value: any): value is StyleObject =>
    property === "--",
  validProperty: (value: any): value is string =>
    typeof value === "string" || typeof value === "number",
};

class Sheet {
  private styleTag: HTMLStyleElement | undefined;

  // Hash->css
  private storedStyles: StoredStyles = {};

  // styles->hash
  private storedClasses: Record<string, string> = {};
  private style: string = "";
  public count = 0;

  constructor(public name: string) {
    const id = `cl-${name}`;

    this.styleTag = this.createStyleTag(id);
  }

  getStyle() {
    return this.style;
  }

  append(css: string) {
    this.style = appendString(this.style, css);
  }

  apply() {
    this.count++;

    if (!this.styleTag) {
      return;
    }

    this.styleTag.innerHTML = this.style;
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

  addRule(property: string, value: string) {
    const key = joinedProperty(property, value);

    if (this.storedClasses[key]) {
      return this.storedClasses[key];
    }

    const hash = genUniqueHash(this.name, key);
    this.storedClasses[key] = hash;
    this.storedStyles[hash] = [property, value];

    this.append(genCssRule(hash, property, value));
    return hash;
  }
}

function joinedProperty(property: string, value: string) {
  return `${property}:${value}`;
}

// Creates the css line for a chunk
function chunkSelector(className: string, property: string, child?: string) {
  const base = makeClassName(className);

  if (is.pseudoSelector(property)) {
    return `${base}${property}`;
  }

  if (is.mediaQuery(property)) {
    return `${property}`;
  }
}

function makeClassName(hash: string) {
  return `.${hash}`;
}

function genCssRule(hash: string, property: string, value: string) {
  return genCssRules(hash, genLine(property, value));
}

function genCssRules(hash: string, content: string): string {
  return `${makeClassName(hash)} { ${content} }`;
}

function camelCaseToDash(str: string) {
  return str.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
}

// Some properties need special handling
function handlePropertyValue(property: string, value: PropertyValue) {
  if (property === "content") {
    return `"${value}"`;
  }

  return value;
}

// Stable hash function.
function genUniqueHash(prefix: string, seed: string) {
  let hash = 0;
  if (seed.length === 0) return hash.toString();
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return `${prefix ?? "cl"}_${hash.toString(36)}`;
}

function appendString(base: string, line: string) {
  return base ? `${base}\n${line}` : line;
}

function genLine(property: string, value: PropertyValue) {
  return `${camelCaseToDash(property)}: ${handlePropertyValue(
    property,
    value
  )};`;
}

function forIn(obj: object, fn: (key: string, value: any) => void) {
  for (const key in obj) {
    fn(key.trim(), obj[key]);
  }
}

type PropertyValue = string | number;
type CSSProperties = keyof CSSStyleDeclaration;
type StyleObject = Partial<Record<CSSProperties, PropertyValue>>;
type Pseudo = `:${string}`;
type MediaQuery = `@media ${string}`;
type CSSVariablesObject = Record<`--${string}`, string>;
type Style = Partial<
  Record<string, any> &
    Partial<{
      "."?: string | string[];
      "--"?: CSSVariablesObject;
    }> &
    Record<Pseudo | MediaQuery, StyleObject> &
    StyleObject
>;
type Styles<K extends string> = Record<K, Style>;
type StoredStyles = Record<string, [property: string, value: string]>;
type ScopedStyles<K extends string> = Record<K, ClassSet>;
type ClassSet = Set<string>;
