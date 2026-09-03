# FlairUp 🎩

Lightweight CSS-in-JS library for UI packages.
Battle tested on [Emoji-Picker-React](https://github.com/ealush/emoji-picker-react).

FlairUp lets package authors ship styles with their package with zero config:
it injects a `<style>` tag at runtime, so consumers never have to import
stylesheets or configure bundlers. It works in the browser, in Shadow DOM,
and with SSR.

## Installation

```bash
npm install flairup
```

## Usage

```javascript
import { createSheet, cx } from 'flairup';

const sheet = createSheet('MyComponent');

const styles = sheet.create({
  button: {
    color: 'red',
    ':hover': {
      color: 'blue',
    },
  },
});

const Button = () => <button className={cx(styles.button)}>Hover Me</button>;
```

## What `create()` returns

`create()` returns a `Record` mapping each scope name to a `Set` of class
names — one entry per scope, not a single `Set`:

```javascript
const styles = sheet.create({
  button: { color: 'red' },
  title: { color: 'blue' },
});

styles.button; // Set { 'MyComponent_abc123' }
styles.title; // Set { 'MyComponent_def456' }

cx(styles.button); // "MyComponent_abc123"
```

One atomic class is generated per CSS declaration:

- Each plain declaration (for example `color: 'red'`) gets its own class and
  its own single-declaration rule. Identical declarations are emitted once
  and shared across scopes.
- Each conditional declaration (inside a pseudo selector, postcondition, or
  media query) gets its own class, so conditional styles compose
  independently.
- Each CSS variable gets its own single-declaration rule — variables are no
  longer grouped into one class per scope.

Property names are written in camelCase and emitted in dash-case
(`backgroundColor` → `background-color`), so both spellings share one
deduplication entry.

## `cx()` composition

`cx()` accepts strings, arrays, `Set`s, and objects (truthy keys win), and
returns a single class string:

```javascript
cx('a', ['b', 'c'], { d: true, e: false }); // "a b c d"
cx(styles.button, styles.title);
```

When classes conflict, the last one passed to `cx()` wins — regardless of the
order the styles were created in:

```javascript
const red = sheet.create({ red: { color: 'red' } });
const blue = sheet.create({ blue: { color: 'blue' } });

cx(red.red, blue.blue); // "...blue..." — blue wins
cx(blue.blue, red.red); // "...red..." — red wins
```

Conflict rules:

- Conflicts are resolved per context. The same property set globally,
  under `:hover`, and under a media query never conflicts with itself —
  each context keeps its class.
- Shorthand/longhand overlap in the same context follows `cx()` order per
  side: single- and multi-value distributive shorthands (`margin`,
  `padding`, `inset`, `gap`, `overflow`, border widths/styles/colors,
  `border-radius`) expand into one atomic class per longhand, so a later
  `margin-top` wins only its side while the other sides survive. A later
  shorthand still wins every side. Values that cannot be split soundly
  (bare `var()`/`env()` references, over-count values, multi-token
  elliptical radii) and non-distributive shorthands (`background`, `font`,
  `border`, ...) stay one atomic class.
- Each CSS variable is its own conflict domain: overriding `--tone` keeps
  an unrelated `--space` from the same scope.
- Classes from different contexts (pseudo selectors, media queries) are
  always preserved.
- Unknown classes (for example utility classes) pass through untouched, and
  repeated classes are deduped.

## `createSheet()` options and mounting

```javascript
const sheet = createSheet('MyComponent');
const sheet = createSheet('MyComponent', { rootNode, nonce });
```

Calling `createSheet(name)` mounts one `<style id="flairup-{name}">` tag into
`document.head` and keeps it synchronized after every `create()` and
`keyframes()` call. `getStyle()` returns the sheet's CSS text, and
`isApplied()` reports whether a style tag is mounted.

The second argument controls where (and whether) the tag mounts:

- `{ rootNode }` — mount under a specific `HTMLElement` or `ShadowRoot`,
  so styles work inside Shadow DOM. A bare element may also be passed
  directly as the second argument.
- `{ rootNode: null }` — never mount a tag. Use this on the server (or in
  tests) and read the CSS with `getStyle()`.
- `{ nonce }` — set a `nonce` attribute on the style tag for
  Content-Security-Policy environments. The nonce is also applied to an
  adopted server-rendered tag.

Sheets with the same name and the same mount target share one style element
and its CSS state: writes from any handle are visible through every handle,
and identical declarations are still emitted only once. Different names, or
the same name under different roots, stay isolated.

## Keyframes

`sheet.keyframes()` defines animations and returns a `Record` mapping each
keyframe name to its generated (hashed) animation name. Names are prefixed
with the sheet name and numbered independently of created styles:

```javascript
const sheet = createSheet('Spinner');

const { spin } = sheet.keyframes({
  spin: {
    from: { transform: 'rotate(0deg)' },
    to: { transform: 'rotate(360deg)' },
  },
});
// spin === 'Spinner_0_spin'

const styles = sheet.create({
  icon: {
    color: 'red',
    animationName: spin,
    animationDuration: '1s',
    animationIterationCount: 'infinite',
  },
});
```

The `@keyframes` rules are written into the same style element as the rest of
the sheet's CSS.

## Conditions

### Scoping styles under a known class name (preconditions)

Nest scopes under a condition key to apply them only beneath a known
selector:

```javascript
const styles = sheet.create({
  '.theme-dark': {
    button: {
      color: 'red',
      ':hover': {
        color: 'blue',
      },
    },
  },
  button: {
    color: 'green',
  },
});
```

### Scoping lower level styles under a selector (postconditions)

Nest condition keys inside a scope to target lower level elements. All of
the following prefixes are supported:

- `.class` — descendant class: `'.menu'` → `.hash .menu`
- `:pseudo` / `::element` — pseudo selectors and elements: `':hover'`,
  `'::before'`
- `>` / `+` / `~` — combinators: `'> .icon'`, `'+ .next'`, `'~ .sibling'`
- `*` — universal selector, with or without a suffix
- `&.class` — same element plus a class, no space: `'.hash.active'`
- `&:pseudo` — same element plus a pseudo selector, no space:
  `'.hash:hover'`

```javascript
const styles = sheet.create({
  button: {
    '.menu': {
      color: 'red',
    },
    '&.active': {
      color: 'blue',
    },
  },
});
```

Postconditions chain with preconditions and media queries, joining nested
levels with a space (except `&` conditions, which attach directly).

### Media queries

```javascript
const styles = sheet.create({
  button: {
    color: 'red',
    '@media (max-width: 600px)': {
      color: 'blue',
    },
  },
});
```

The same declaration inside and outside a media query gets distinct classes,
so global and media rules never clash or collapse into each other.

### Pseudo selectors and pseudo elements

```javascript
const styles = sheet.create({
  button: {
    color: 'red',
    ':hover': {
      color: 'blue',
    },
    '::before': {
      content: '🎩',
    },
  },
});
```

### CSS variables

```javascript
const styles = sheet.create({
  button: {
    '--': {
      '--color': 'red',
      '--hover-color': 'blue',
    },
  },
});
```

Each variable produces its own single-declaration rule, so one variable can
be overridden (via `cx()` order) without affecting the others.

### Custom class names

```javascript
const styles = sheet.create({
  button: {
    '.': 'my-button', // or ["my-button", "button-main"]
    color: 'red',
  },
});
```

Custom classes are added to the scope's `Set` as-is, alongside the generated
classes.

## SSR

Render the sheet's CSS into a style tag whose `id` matches the sheet
(`flairup-{name}`). On the client, `createSheet()` with the same name adopts
that tag instead of mounting a duplicate, preserving the server CSS and
appending only new rules:

```jsx
import { createSheet } from 'flairup';

const sheet = createSheet('MyComponent');

export function SSRStyles() {
  if (sheet.isApplied()) {
    return null;
  }

  return (
    <style
      id="flairup-MyComponent"
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: sheet.getStyle() }}
    />
  );
}
```

Place `<SSRStyles />` anywhere inside your component. When there is no
server tag (pure client render), the sheet mounts its own tag as usual.

## What does the output look like?

Given this input:

```javascript
import { createSheet } from 'flairup';

const sheet = createSheet('Button', null);

const styles = sheet.create({
  button: {
    color: 'red',
    '--': { '--bg': 'white' },
    ':hover': { color: 'blue' },
    '@media (max-width: 600px)': { color: 'green' },
  },
});

const { fade } = sheet.keyframes({
  fade: { from: { opacity: '0' }, to: { opacity: '1' } },
});
```

`sheet.getStyle()` returns exactly this CSS:

```css
.Button_wqxq0q {color:red;}
.Button_x5i9n8 {--bg:white;}
.Button_-w97goy:hover {color:blue;}
@media (max-width: 600px) {
.Button_se7zu2 {color:green;}
}
@keyframes Button_0_fade {
from { opacity:0; }
to { opacity:1; }
}
```

Each declaration produces one atomic class with one single-declaration
rule, conditional declarations get their own classes, and keyframes are
named `{sheet}_{n}_{name}`. Exact class hashes vary with the sheet name and
creation order.
