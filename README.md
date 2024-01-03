# FlairUp 🎩

Lightweight CSS-In-JS library for packages.
Initially created for [Emoji-Picker-React](https://github.com/ealush/emoji-picker-react).

## Installation

```bash
npm install flairup
```

## Core Concepts

### Zero Config

The main issue that FlairUp is trying to tackle is the challenge of bringing your own styles as a third-party dependency. There is no standard way for configuring your styling that will work in all environments and with all bundlers.

It will either break on some bundlers, or will require the user to import the styles manually, which is not ideal.

### OneTime-Runtime

FlairUp is a one-time-runtime library, meaning that it will only run once, when the package is imported.
While usually, it is not recommended to have styles computed at runtime, this is the only way we can assure the library is working in all environments.

### Style Tag added to DOM

The way FlairUp works is by adding a `<style>` tag to the DOM, and injecting the styles into it.

### One Class Per CSS Property

To reduce bloat and improve performance, FlairUp will only add a single class per CSS property, meaning that if a certain style exists in multiple places, it will only be added as one class to the stylesheet, and be reused in all places consuming it.
This is a much more efficient way, allowing us not to worry about de-duplication of stylis.

### The StyleSheet Object

Defining your style has two parts:

1. Creating a stylesheet object using the `createSheet` function. This function adds the style tag to the DOM, and returns a stylesheet object with a `create` function.
2. Using the individual styles using the `create` function.
   In the create function you can define your styles as a javascript object, and get back a Set containing the class names of the styles you defined.

## Supported CSS Features

1. CSS Properties
2. Pseudo Selectors and Pseudo Elements
3. Media Queries
4. Defining of CSS Variables

### Added Features

1. Scoping styles under a known class name
2. Adding custom class names to the stylesheet object

## Usage Example

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

### Adding Custom Class Names

```javascript
const styles = sheet.create({
  button: {
    '.': 'my-button', // or ["my-button", "button-main"]
    color: 'red',
  },
});
```

### Adding Scoped CSS Variables

Unlike regular CSS properties, CSS variables are as a single class per scope.

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

### Adding Media Queries

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

### Adding Pseudo Selectors and Pseudo Elements

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

### Scoping a style under a known class name

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
});
```

## What does the output look like?
![image](https://github.com/ealush/flairup/assets/11255103/aea8f56f-1ccb-4bf1-8fa5-c95da9684726)


 
