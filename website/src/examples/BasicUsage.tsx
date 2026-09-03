import React from 'react';
import { cx } from 'flairup';
import { stylesheet } from '../app/stylesheet';
import { Example } from '../components/Example';

const exampleStyle = {
  button: {
    font: 'inherit',
    fontWeight: '600',
    color: 'var(--btn-fg)',
    backgroundColor: 'var(--btn-bg)',
    padding: '10px 20px',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'background-color 0.15s ease',
    '&:hover': {
      backgroundColor: 'var(--accent-strong)',
    },
    '&:active': {
      transform: 'translateY(1px)',
    },
    '&:focus-visible': {
      outline: '2px solid var(--focus)',
      outlineOffset: '2px',
    },
    '&:disabled': {
      opacity: '0.5',
      cursor: 'not-allowed',
    },
  },
};

const styles = stylesheet.create({
  row: {
    display: 'flex',
    gap: '0.75em',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  ...exampleStyle,
});

export function BasicUsage() {
  return (
    <Example
      title="Basic usage"
      description="The whole loop: define scopes with sheet.create, get a set of classes back per scope, and combine them with cx() where the element renders."
      exampleStyle={exampleStyle}
      usage={`function SaveButton() {
  return (
    <button className={cx(styles.button)}>
      Save changes
    </button>
  );
}`}
    >
      <div className={cx(styles.row)}>
        <button className={cx(styles.button)}>Save changes</button>
        <button className={cx(styles.button)} disabled>
          Saving…
        </button>
      </div>
    </Example>
  );
}
