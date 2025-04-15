import React from 'react';
import { cx } from 'flairup';
import { stylesheet } from '../app/stylesheet';
import { Example } from '../components/Example';

const exampleStyle = {
  button: {
    color: 'blue',
    backgroundColor: 'white',
    padding: '10px 20px',
    border: '1px solid blue',
    borderRadius: '5px',
    cursor: 'pointer',
    ':hover': {
      backgroundColor: 'lightblue',
      borderColor: 'darkblue',
    },
  },
};

const styles = stylesheet.create({
  ...exampleStyle,
});

export function BasicUsage() {
  return (
    <Example 
      title="Basic Usage" 
      description="The most basic usage of FlairUp, demonstrating how to create and apply styles to a component. This example shows a simple button with hover effects using the `create` function to define styles and the `cx` function to apply them."
      exampleStyle={exampleStyle}
      usage={`function MyButton() {
  return (
    <button className={cx(styles.button)}>
      Hover me!
    </button>
  );
}`}
    >
      <button className={cx(styles.button)}>Hover me!</button>
    </Example>
  );
} 