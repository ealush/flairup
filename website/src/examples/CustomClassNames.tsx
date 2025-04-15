import React from 'react';
import { cx } from 'flairup';
import { stylesheet } from '../app/stylesheet';
import { Example } from '../components/Example';

const exampleStyle = {
  button: {
    backgroundColor: '#3498db',
    color: 'white',
    padding: '10px 20px',
    borderRadius: '5px',
    border: 'none',
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: '#2980b9',
    },
  },
  'button--primary': {
    backgroundColor: '#2ecc71',
    '&:hover': {
      backgroundColor: '#27ae60',
    },
  },
  'button--danger': {
    backgroundColor: '#e74c3c',
    '&:hover': {
      backgroundColor: '#c0392b',
    },
  },
};

const styles = stylesheet.create({
  buttonGroup: {
    display: 'flex',
    gap: '1em',
  },
  ...exampleStyle,
});

export function CustomClassNames() {
  return (
    <Example 
      title="Custom Class Names" 
      description="Demonstrates how to use custom class names in FlairUp. This example shows a button group with different variants (default, primary, and danger) using custom class names. The styles are defined using the `create` function and applied using the `cx` function, allowing for easy composition of styles."
      exampleStyle={exampleStyle}
      usage={`function ButtonGroup() {
  return (
    <div className={cx(styles.buttonGroup)}>
      <button className={cx(styles.button)}>Default</button>
      <button className={cx(styles.button, styles['button--primary'])}>Primary</button>
      <button className={cx(styles.button, styles['button--danger'])}>Danger</button>
    </div>
  );
}`}
    >
      <div className={cx(styles.buttonGroup)}>
        <button className={cx(styles.button)}>Default</button>
        <button className={cx(styles.button, styles['button--primary'])}>Primary</button>
        <button className={cx(styles.button, styles['button--danger'])}>Danger</button>
      </div>
    </Example>
  );
} 