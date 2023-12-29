export function createSheet(name: string) {
  const sheet = new Sheet(name);

  return {
    create,
  };

  function create<K extends string>(styles: Styles<K>) {
    const localStyles = iterateScopedStyles<K>(name, styles, sheet);

    sheet.apply();

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
    let scopeClassName = genUniqueHash(name, count());

    output[scope] = new Set<string>();

    const scopedStyles = styles[scope];
    for (const property in scopedStyles) {
      if (is.pseudoSelector(property)) {
        sheet.addChunk(
          scopeClassName,
          property,
          scopedStyles[property as keyof typeof scopedStyles] as StyleObject
        );

        output[scope].add(scopeClassName);

        continue;
      }

      if (is.directClass(property)) {
        [].concat(scopedStyles[property as string]).forEach((className) => {
          output[scope].add(className);
        });
        continue;
      }

      if (is.mediaQuery(property)) {
        const mediaQuery = property;

        sheet.append(`${mediaQuery} {`);

        for (const property in scopedStyles[mediaQuery]) {
          const value =
            // @ts-ignore
            scopedStyles[mediaQuery][property as keyof typeof scopedStyles];
          const ruleClassName = sheet.addRule(property, value as string);

          output[scope].add(ruleClassName);
        }

        sheet.append(`}`);

        continue;
      }

      const value = scopedStyles[property as keyof typeof scopedStyles];
      const ruleClassName = sheet.addRule(property, value as string);

      output[scope].add(ruleClassName);
    }
  }

  return output;
}

const is = {
  pseudoSelector: (selector: string) => selector.startsWith(":"),
  mediaQuery: (property: string) => property.startsWith("@media"),
  directClass: (property: string) => property === ".",
};

class Sheet {
  private styleTag: HTMLStyleElement | undefined;
  private storedStyles: StoredStyles = {};
  private storedClasses: Record<string, string> = {};
  private style: string = "";

  constructor(private name: string) {
    const id = `cl-${name}-${genUniqueHash(name, count())}`;

    this.styleTag = this.createStyleTag(id);
  }

  append(css: string) {
    this.style = appendString(this.style, css);
  }

  apply() {
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
    const key = `${property}:${value}`;

    if (this.storedClasses[key]) {
      return key;
    }

    const hash = genUniqueHash(this.name, key);
    this.storedClasses[key] = hash;
    this.storedStyles[hash] = [property, value];

    this.append(genCssRule(hash, property, value));
    return hash;
  }

  addChunk(className: string, property: string, styleObject: StyleObject) {
    let output = "";
    const selector = `.${className}${property}`;

    for (const property in styleObject) {
      const value = styleObject[
        property as keyof typeof styleObject
      ] as PropertyValue;
      const line = genLine(property, value);
      output = appendString(output, line);
    }

    this.append(`${selector} { ${output} }`);
  }
}

function genCssRule(hash: string, property: string, value: string) {
  return `.${hash} { ${genLine(property, value)} }`;
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

export function xJoin(...styles: ClassSet[]): string {
  return styles.reduce((acc, curr) => {
    return `${acc} ${Array.from(curr).join(" ")}`;
  }, "");
}

type PropertyValue = string | number;
type AllowedStyleProperties = keyof CSSStyleDeclaration;
type StyleObject = Partial<Record<AllowedStyleProperties, PropertyValue>>;
type Pseudo = `:${string}`;
type MediaQuery = `@media ${string}`;
type ClassIndication = `.`;
type Style = StyleObject &
  Record<Pseudo | MediaQuery, StyleObject> &
  Partial<Record<ClassIndication, string | string[]>>;
type Styles<K extends string> = Record<K, Style>;
type StoredStyles = Record<string, [property: string, value: string]>;
type ScopedStyles<K extends string> = Record<K, ClassSet>;
type ClassSet = Set<string>;

function appendString(base: string, line: string) {
  return base ? `${base}\n${line}` : line;
}

const count = (() => {
  let i = 0;
  return () => `${i++}`;
})();
