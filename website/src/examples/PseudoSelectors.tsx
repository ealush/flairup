import React from 'react';
import { cx } from 'flairup';
import { stylesheet } from '../app/stylesheet';
import { Example } from '../components/Example';

const exampleStyle = {
  invite: {
    maxWidth: '24rem',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    marginBottom: '12px',
  },
  label: {
    fontWeight: '600',
    fontSize: '0.95rem',
  },
  input: {
    font: 'inherit',
    color: 'var(--ink)',
    backgroundColor: 'var(--paper)',
    border: '1px solid var(--field-border)',
    borderRadius: '8px',
    padding: '10px 12px',
    '&:hover': {
      borderColor: 'var(--muted)',
    },
    '&:focus-visible': {
      outline: '2px solid var(--focus)',
      outlineOffset: '1px',
    },
    '&::placeholder': {
      color: 'var(--muted)',
      opacity: '1',
    },
    '&:disabled': {
      opacity: '0.55',
      cursor: 'not-allowed',
    },
  },
  button: {
    font: 'inherit',
    fontWeight: '600',
    color: 'var(--btn-fg)',
    backgroundColor: 'var(--btn-bg)',
    padding: '10px 20px',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: 'var(--accent-strong)',
    },
    '&:active': {
      transform: 'translateY(1px)',
    },
  },
};

const styles = stylesheet.create({
  ...exampleStyle,
});

export function PseudoSelectors() {
  return (
    <Example
      title="Pseudo selectors and elements"
      description="States live next to the declarations they change: :hover and :active on the button, :focus-visible and ::placeholder on the input. No separate selectors to keep in sync."
      exampleStyle={exampleStyle}
      usage={`function Invite() {
  return (
    <div className={cx(styles.invite)}>
      <div className={cx(styles.field)}>
        <label className={cx(styles.label)} htmlFor="invite-email">
          Work email
        </label>
        <input
          id="invite-email"
          type="email"
          placeholder="teammate@company.com"
          className={cx(styles.input)}
        />
      </div>
      <button type="button" className={cx(styles.button)}>
        Send invite
      </button>
    </div>
  );
}`}
    >
      <div className={cx(styles.invite)}>
        <div className={cx(styles.field)}>
          <label className={cx(styles.label)} htmlFor="example-invite-email">
            Work email
          </label>
          <input
            id="example-invite-email"
            type="email"
            placeholder="teammate@company.com"
            className={cx(styles.input)}
          />
        </div>
        <button type="button" className={cx(styles.button)}>
          Send invite
        </button>
      </div>
    </Example>
  );
}
