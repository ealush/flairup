import React from 'react';
import { cx } from 'flairup';
import { stylesheet } from '../app/stylesheet';
import { Example } from '../components/Example';

const exampleStyle = {
  variantPrimary: {
    font: 'inherit',
    fontWeight: '600',
    padding: '10px 20px',
    borderRadius: '8px',
    border: '1px solid transparent',
    cursor: 'pointer',
    color: 'var(--btn-fg)',
    backgroundColor: 'var(--btn-bg)',
    transition: 'background-color 0.15s ease',
    '&:hover': {
      backgroundColor: 'var(--accent-strong)',
    },
  },
  variantSecondary: {
    font: 'inherit',
    fontWeight: '600',
    padding: '10px 20px',
    borderRadius: '8px',
    border: '1px solid var(--field-border)',
    cursor: 'pointer',
    color: 'var(--ink)',
    backgroundColor: 'transparent',
    transition: 'background-color 0.15s ease',
    '&:hover': {
      backgroundColor: 'var(--card)',
    },
  },
  variantQuiet: {
    font: 'inherit',
    fontWeight: '600',
    padding: '10px 20px',
    borderRadius: '8px',
    border: '1px solid transparent',
    cursor: 'pointer',
    color: 'var(--accent)',
    backgroundColor: 'transparent',
    transition: 'background-color 0.15s ease',
    '&:hover': {
      backgroundColor: 'var(--card)',
    },
  },
};

const styles = stylesheet.create({
  buttonGroup: {
    display: 'flex',
    gap: '0.75em',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  ...exampleStyle,
});

export function StylingVariantsAndScopes() {
  return (
    <Example
      title="Variants and scopes"
      description="Each variant is a complete scope with everything the button needs. Variants never layer, so there is no question which rule wins — pick one per state and let cx() handle the rest."
      exampleStyle={exampleStyle}
      usage={`function Actions({ kind }: { kind: 'primary' | 'secondary' | 'quiet' }) {
  const variants = {
    primary: styles.variantPrimary,
    secondary: styles.variantSecondary,
    quiet: styles.variantQuiet,
  };
  return (
    <div className={cx(styles.buttonGroup)}>
      <button className={cx(variants[kind])}>Publish</button>
    </div>
  );
}`}
    >
      <div className={cx(styles.buttonGroup)}>
        <button className={cx(styles.variantPrimary)}>Publish</button>
        <button className={cx(styles.variantSecondary)}>Save draft</button>
        <button className={cx(styles.variantQuiet)}>Discard</button>
      </div>
    </Example>
  );
}
