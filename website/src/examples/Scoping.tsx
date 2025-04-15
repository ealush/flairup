import React from 'react';
import { cx } from 'flairup';
import { stylesheet } from '../app/stylesheet';
import { Example } from '../components/Example';

const exampleStyle = {
  '.theme-dark': {
    button: {
      backgroundColor: '#3498db',
      color: 'white',
      '&:hover': {
        backgroundColor: '#2980b9',
      },
    },
  },
  '.theme-light': {
    button: {
      backgroundColor: '#2ecc71',
      color: 'white',
      '&:hover': {
        backgroundColor: '#27ae60',
      },
    },
  },
};

const styles = stylesheet.create({
  themeContainer: {
    display: 'flex',
    gap: '1em',
    marginBottom: '1em',
  },
  themeBox: {
    padding: '1em',
    borderRadius: '8px',
    flex: '1',
  },
  themeDark: {
    backgroundColor: '#2c3e50',
    color: '#ecf0f1',
  },
  themeLight: {
    backgroundColor: '#ecf0f1',
    color: '#2c3e50',
  },
  button: {
    padding: '10px 20px',
    borderRadius: '5px',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  ...exampleStyle,
});

export function Scoping() {
  return (
    <Example 
      title="Style Scoping" 
      description="Shows how to scope styles under known class names in FlairUp. This example demonstrates theme-based styling where button styles change based on the parent theme class (dark or light). The styles are scoped using the `.theme-dark` and `.theme-light` selectors, allowing for contextual styling."
      exampleStyle={exampleStyle}
      usage={`function ThemeButtons() {
  return (
    <div className={cx(styles.themeContainer)}>
      <div className={cx(styles.themeBox, styles.themeDark, 'theme-dark')}>
        <button className={cx(styles.button)}>Dark Theme Button</button>
      </div>
      <div className={cx(styles.themeBox, styles.themeLight, 'theme-light')}>
        <button className={cx(styles.button)}>Light Theme Button</button>
      </div>
    </div>
  );
}`}
    >
      <div className={cx(styles.themeContainer)}>
        <div className={cx(styles.themeBox, styles.themeDark, 'theme-dark')}>
          <button className={cx(styles.button)}>Dark Theme Button</button>
        </div>
        <div className={cx(styles.themeBox, styles.themeLight, 'theme-light')}>
          <button className={cx(styles.button)}>Light Theme Button</button>
        </div>
      </div>
    </Example>
  );
} 