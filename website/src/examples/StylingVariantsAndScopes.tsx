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
  'primary': {
    backgroundColor: '#2ecc71',
    '&:hover': {
      backgroundColor: '#27ae60',
    },
  },
  'danger': {
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

export function StylingVariantsAndScopes() {
  return (
    <Example 
      title="Styling Variants and Scopes" 
      description="Demonstrates FlairUp's ability to manage multiple, scoped styles within a single stylesheet. This example showcases a button group with different visual variants (default, primary, and danger), all defined within the same `styles` object. The `create` function is used to define these styles, and the `cx` function facilitates their application, allowing for straightforward composition of different style scopes to a single element."
      exampleStyle={exampleStyle}
      usage={`function ButtonGroup() {
  return (
    <div className={cx(styles.buttonGroup)}>
      <button className={cx(styles.button)}>Default</button>
      <button className={cx(styles.button, styles.primary)}>Primary</button>
      <button className={cx(styles.button, styles.danger)}>Danger</button>
    </div>
  );
}`}
    >
      <div className={cx(styles.buttonGroup)}>
        <button className={cx(styles.button)}>Default</button>
        <button className={cx(styles.button, styles.primary)}>Primary</button>
        <button className={cx(styles.button, styles.danger)}>Danger</button>
      </div>
    </Example>
  );
} 