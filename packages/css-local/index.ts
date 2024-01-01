export function cx(...styles: ClassSet[]): string {
  return styles
    .reduce((acc, curr) => {
      return `${acc} ${Array.from(curr).join(" ")}`;
    }, "")
    .trim();
}

type createSheetReturn = {
  create: <K extends string>(styles: Styles<K>) => ScopedStyles<K>;
  getStyle: () => string;
};

export function createSheet(name: string): createSheetReturn {
  const sheet = new Sheet(name);

  return {
    create,
    getStyle: sheet.getStyle.bind(sheet),
  };

  function create<K extends string>(styles: Styles<K>) {
    const scopedStyles: ScopedStyles<K> = {} as ScopedStyles<K>;

    forIn(styles, (scopeName, styles) => {
      if (is.topLevelClass(scopeName, styles)) {
        const scopeClassName = genUniqueHash(sheet.name, scopeName);
        const parentClass = scopeName.slice(1);
        forIn(styles, (property, value) => {
          iterateStyles(
            sheet,
            value as Styles<K>,
            scopeClassName,
            parentClass
          ).forEach((className: string) => {
            addScopedStyle(property as unknown as K, className);
          });
        });
        return;
      }
      const scopeClassName = genUniqueHash(sheet.name, scopeName);
      iterateStyles(sheet, styles as Styles<K>, scopeClassName).forEach(
        (className) => {
          addScopedStyle(scopeName as K, className);
        }
      );
    });

    sheet.apply();

    return scopedStyles;

    function addScopedStyle(name: K, className: string) {
      scopedStyles[name] = scopedStyles[name] ?? new Set<string>();
      scopedStyles[name].add(className);
    }
  }
}

function iterateStyles<K extends string>(
  sheet: Sheet,
  styles: Styles<K>,
  scopeClassName: string,
  parentClassName?: string
) {
  const output: ClassSet = new Set<string>();
  forIn(styles, (property, value) => {
    if (is.directClass(property, value)) {
      return handleAddedClassnames(value).forEach((classes) =>
        output.add(classes)
      );
    }
    if (
      is.pseudoSelector(property) ||
      is.mediaQuery(property) ||
      is.cssVariables(property, value)
    ) {
      return handleChunks(sheet, value ?? {}, property, scopeClassName).forEach(
        (classes) => output.add(classes)
      );
    }

    if (is.validProperty(value)) {
      const ruleClassName = sheet.addRule(property, value, parentClassName);
      return output.add(ruleClassName);
    }
  });

  return output;
}

function handleAddedClassnames(classes: string | string[]) {
  return [].concat(classes as unknown as []);
}

function handleChunks(
  sheet: Sheet,
  styles: StyleObject,
  property: string,
  scopeClassName: string
) {
  const classes: ClassSet = new Set<string>();

  const chunkRows: string[] = [];
  forIn(styles, (property: string, value) => {
    if (is.validProperty(value)) {
      chunkRows.push(genLine(property, value));
      return;
    }

    iterateStyles(sheet, value ?? {}, scopeClassName).forEach((className) =>
      classes.add(className)
    );
  });

  if (chunkRows.length) {
    const output = chunkRows.join("\n");
    sheet.append(
      `${chunkSelector([scopeClassName], property)} ${wrapWithCurlys(
        is.mediaQuery(property)
          ? genCssRules([scopeClassName], output)
          : output,
        true
      )}`
    );
  }

  classes.add(scopeClassName);
  return classes;
}

// Selectors
const is = {
  pseudoSelector: (selector: string) => selector.startsWith(":"),
  mediaQuery: (property: string) => property.startsWith("@media"),
  directClass: (property: string, _: unknown): _ is string | string[] =>
    property === ".",
  cssVariables: (property: string, _: unknown): _ is StyleObject =>
    property === "--",
  validProperty: (value: unknown): value is string =>
    typeof value === "string" || typeof value === "number",
  topLevelClass: (property: string, _: unknown): _ is StyleObject =>
    property.startsWith(".") && property.length > 1,
  string: (value: unknown): value is string => typeof value === "string",
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
    styleTag.id = `css-local-${id}`;
    document.head.appendChild(styleTag);
    return styleTag;
  }

  addRule(property: string, value: string, parentClassName?: string): string {
    const key = joinedProperty(property, value);

    const storedClass = this.storedClasses[key];
    if (is.string(storedClass)) {
      return storedClass;
    }

    const hash = genUniqueHash(this.name, key);
    this.storedClasses[key] = hash;
    this.storedStyles[hash] = [property, value];

    this.append(genCssRule([parentClassName, hash], property, value));
    return hash;
  }
}

function joinedProperty(property: string, value: string) {
  return `${property}:${value}`;
}

// Creates the css line for a chunk
function chunkSelector(className: ClassList, property: string) {
  const base = makeClassName(className);

  if (is.pseudoSelector(property)) {
    return `${base}${property}`;
  }

  if (is.mediaQuery(property)) {
    return `${property}`;
  }

  return base;
}

function makeClassName(classes: ClassList) {
  return classes
    .filter(Boolean)
    .map((c) => `.${c}`)
    .join(" ");
}

function genCssRule(classes: ClassList, property: string, value: string) {
  return genCssRules(classes, genLine(property, value));
}

function genCssRules(classes: ClassList, content: string): string {
  return `${makeClassName(classes)} ${wrapWithCurlys(content)}`;
}

function wrapWithCurlys(content: string, breakLine = false) {
  return [breakLine ? "{\n" : "{", content, breakLine ? "\n}" : "}"].join("");
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

function forIn<O extends Record<string, unknown>>(
  obj: O,
  fn: (key: string, value: O[string]) => void
) {
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
  Record<string, unknown> &
    Partial<{
      "."?: string | string[];
      "--"?: CSSVariablesObject;
    }> &
    Record<Pseudo | MediaQuery, StyleObject> &
    StyleObject
>;
type ParentClass = `.${string}`;
type Styles<K extends string> = Partial<
  Record<K, Style | Record<ParentClass, Record<K, Style>>>
>;
type StoredStyles = Record<string, [property: string, value: string]>;
type ScopedStyles<K extends string> = Record<K, ClassSet>;
type ClassSet = Set<string>;
type ClassList = (string | undefined)[];
