import React from 'react';
import { cx } from 'flairup';
import { stylesheet } from '../app/stylesheet';
import { Example } from '../components/Example';

const exampleStyle = {
  alert: {
    '--tone': '#9c1a24',
    backgroundColor: 'var(--card)',
    borderLeft: '4px solid var(--tone)',
    borderRadius: '8px',
    padding: '12px 16px',
    marginBottom: '12px',
    '@media (prefers-color-scheme: dark)': {
      '--tone': '#ec9aae',
    },
  },
  alertTitle: {
    fontWeight: '650',
    color: 'var(--tone)',
    marginBottom: '0.25em',
  },
  alertText: {
    color: 'var(--muted)',
    fontSize: '0.95rem',
  },
  toneSuccess: {
    '--tone': '#237a4b',
    '@media (prefers-color-scheme: dark)': {
      '--tone': '#7fc79b',
    },
  },
  toneWarning: {
    '--tone': '#8a5a00',
    '@media (prefers-color-scheme: dark)': {
      '--tone': '#d9a93f',
    },
  },
};

const styles = stylesheet.create({
  ...exampleStyle,
});

export function CSSVariables() {
  return (
    <Example
      title="CSS variables"
      description="A scope can set variables instead of declarations, and one class carries all of them. Each tone is a literal hex value, with its dark-mode counterpart nested in a media query — override --tone per instance and every declaration that reads it follows."
      exampleStyle={exampleStyle}
      usage={`function Notices() {
  return (
    <>
      <div className={cx(styles.alert)}>
        <p className={cx(styles.alertTitle)}>Payment failed</p>
        <p className={cx(styles.alertText)}>Your card was declined.</p>
      </div>
      <div className={cx(styles.alert, styles.toneSuccess)}>
        <p className={cx(styles.alertTitle)}>Payment received</p>
        <p className={cx(styles.alertText)}>Receipt sent to your inbox.</p>
      </div>
    </>
  );
}`}
    >
      <div className={cx(styles.alert)}>
        <p className={cx(styles.alertTitle)}>Payment failed</p>
        <p className={cx(styles.alertText)}>
          Your card was declined. Try another payment method.
        </p>
      </div>
      <div className={cx(styles.alert, styles.toneSuccess)}>
        <p className={cx(styles.alertTitle)}>Payment received</p>
        <p className={cx(styles.alertText)}>
          Thanks — a receipt is on its way to your inbox.
        </p>
      </div>
      <div className={cx(styles.alert, styles.toneWarning)}>
        <p className={cx(styles.alertTitle)}>Trial ends in 3 days</p>
        <p className={cx(styles.alertText)}>
          Add a payment method to keep your workspace running.
        </p>
      </div>
    </Example>
  );
}
