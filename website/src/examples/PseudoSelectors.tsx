import React from 'react';
import { cx } from 'flairup';
import { stylesheet } from '../app/stylesheet';
import { Example } from '../components/Example';

const exampleStyle = {
  button: {
    backgroundColor: '#f1c40f',
    color: 'white',
    padding: '10px 20px',
    borderRadius: '5px',
    border: 'none',
    cursor: 'pointer',
    position: 'relative',
    transition: 'all 0.3s ease',
    ':hover': {
      backgroundColor: '#f39c12',
      transform: 'translateY(-2px)',
    },
    ':active': {
      transform: 'translateY(0)',
    },
    ':focus': {
      outline: 'none',
      boxShadow: '0 0 0 3px rgba(241, 196, 15, 0.4)',
    },
    '::before': {
      content: '🎩',
      position: 'absolute',
      left: '10px',
      top: '50%',
      transform: 'translateY(-50%)',
    },
    '::after': {
      content: '→',
      position: 'absolute',
      right: '10px',
      top: '50%',
      transform: 'translateY(-50%)',
    },
  },
};

const styles = stylesheet.create({
  ...exampleStyle,
});

export function PseudoSelectors() {
  return (
    <Example
      title="Pseudo Selectors & Elements"
      description="Demonstrates the use of pseudo-selectors and pseudo-elements in FlairUp. This example shows a button with hover, active, and focus states, as well as before and after pseudo-elements. The styles are defined using the standard CSS pseudo-selector syntax within the style object."
      exampleStyle={exampleStyle}
      usage={`function FancyButton() {
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
