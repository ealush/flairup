import React from 'react';
import { cx } from 'flairup';
import { stylesheet } from '../app/stylesheet';
import { Example } from '../components/Example';

const exampleStyle = {
  box: {
    '--box-bg-color': 'lightgreen',
    backgroundColor: 'var(--box-bg-color)',
    padding: '15px',
    borderRadius: '8px',
    margin: '10px 0',
  },
  'box--primary': {
    '--box-bg-color': 'lightblue',
  },
  'box--secondary': {
    '--box-bg-color': 'lightcoral',
  },
  button: {
    '--': {
      '--button-bg': '#3498db',
      '--button-hover-bg': '#2980b9',
      '--button-text': 'white',
      '--button-padding': '10px 20px',
      '--button-radius': '4px',
    },
    backgroundColor: 'var(--button-bg)',
    color: 'var(--button-text)',
    padding: 'var(--button-padding)',
    borderRadius: 'var(--button-radius)',
    border: 'none',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
    ':hover': {
      backgroundColor: 'var(--button-hover-bg)',
    },
  },
  'button--danger': {
    '--': {
      '--button-bg': '#e74c3c',
      '--button-hover-bg': '#c0392b',
    },
  },
  'button--success': {
    '--': {
      '--button-bg': '#2ecc71',
      '--button-hover-bg': '#27ae60',
    },
  },
};

const styles = stylesheet.create({
  ...exampleStyle,
});

export function CSSVariables() {
  return (
    <Example
      title="CSS Variables"
      description="Shows how to use CSS variables in FlairUp. Unlike regular CSS properties, CSS variables are added as a single class per scope. This example demonstrates how to define and use CSS variables to create themeable components with different color variants."
      exampleStyle={exampleStyle}
      usage={`function Boxes() {
  return (
    <>
      <div className={cx(styles.box)}>Default Box</div>
      <div className={cx(styles.box, styles['box--primary'])}>Primary Box</div>
      <div className={cx(styles.box, styles['box--secondary'])}>Secondary Box</div>
    </>
  );
}`}
    >
      <div className={cx(styles.box)}>Default Box</div>
      <div className={cx(styles.box, styles['box--primary'])}>Primary Box</div>
      <div className={cx(styles.box, styles['box--secondary'])}>
        Secondary Box
      </div>

      <div style={{ marginTop: '20px' }}>
        <button className={cx(styles.button)}>Default Button</button>
        <button
          className={cx(styles.button, styles['button--danger'])}
          style={{ marginLeft: '10px' }}
        >
          Danger Button
        </button>
        <button
          className={cx(styles.button, styles['button--success'])}
          style={{ marginLeft: '10px' }}
        >
          Success Button
        </button>
      </div>
    </Example>
  );
}
