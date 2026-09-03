import React from 'react';
import { cx } from 'flairup';
import { stylesheet } from '../app/stylesheet';
import { Example } from '../components/Example';
import { BreakpointBadge } from '../components/BreakpointBadge';

const exampleStyle = {
  badge: {
    color: 'var(--muted)',
    fontSize: '0.9rem',
    marginBottom: '1em',
  },
  badgeValue: {
    fontWeight: '650',
    color: 'var(--ink)',
  },
  card: {
    backgroundColor: 'var(--paper)',
    border: '1px solid var(--line)',
    borderRadius: '8px',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    '@media (min-width: 480px)': {
      padding: '22px',
      gap: '10px',
    },
    '@media (min-width: 720px)': {
      flexDirection: 'row',
      gap: '16px',
      padding: '22px 26px',
    },
    '@media (min-width: 1024px)': {
      maxWidth: '60rem',
      marginInline: 'auto',
      padding: '28px',
    },
    '@media (min-width: 1280px)': {
      borderLeft: '4px solid var(--accent)',
      padding: '28px 32px',
    },
  },
  cardBody: {
    minWidth: '0',
    '@media (min-width: 720px)': {
      flex: '1 1 auto',
    },
  },
  cardEyebrow: {
    fontSize: '0.8rem',
    fontWeight: '650',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: 'var(--accent)',
  },
  cardTitle: {
    fontFamily: 'var(--font-display)',
    fontSize: '1.25rem',
    fontWeight: '700',
    '@media (min-width: 480px)': {
      fontSize: '1.4rem',
    },
    '@media (min-width: 1280px)': {
      fontSize: '2rem',
    },
  },
  cardText: {
    color: 'var(--muted)',
    fontSize: '0.95rem',
  },
  cardButton: {
    font: 'inherit',
    fontWeight: '600',
    color: 'var(--btn-fg)',
    backgroundColor: 'var(--btn-bg)',
    padding: '10px 20px',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    alignSelf: 'flex-start',
    '&:hover': {
      backgroundColor: 'var(--accent-strong)',
    },
    '@media (min-width: 720px)': {
      marginLeft: 'auto',
      alignSelf: 'center',
    },
  },
};

const styles = stylesheet.create({
  ...exampleStyle,
});

const badgeClasses = {
  badge: cx(styles.badge),
  value: cx(styles.badgeValue),
};

export function MediaQueries() {
  return (
    <Example
      title="Media queries"
      description="Nest @media blocks inside the scope they modify. One card, five breakpoints: spacing grows at 480px, it turns horizontal at 720px, settles into a centered measure at 1024px, and gains an accent edge with larger type at 1280px. The badge names the active breakpoint as you resize. Each step uses distinct values: under flairup 1.1.0, identical declarations share one class, so a repeated value would apply at every width."
      exampleStyle={exampleStyle}
      usage={`function Announcement() {
  return (
    <div className={cx(styles.card)}>
      <div className={cx(styles.cardBody)}>
        <p className={cx(styles.cardEyebrow)}>New in 1.1</p>
        <p className={cx(styles.cardTitle)}>Deterministic cx()</p>
        <p className={cx(styles.cardText)}>
          Overrides resolve in cx() order, not creation order.
        </p>
      </div>
      <button type="button" className={cx(styles.cardButton)}>
        Read the notes
      </button>
    </div>
  );
}`}
    >
      <BreakpointBadge
        className={badgeClasses.badge}
        valueClassName={badgeClasses.value}
      />
      <div className={cx(styles.card)}>
        <div className={cx(styles.cardBody)}>
          <p className={cx(styles.cardEyebrow)}>New in 1.1</p>
          <p className={cx(styles.cardTitle)}>Deterministic cx()</p>
          <p className={cx(styles.cardText)}>
            Overrides resolve in cx() order, not creation order.
          </p>
        </div>
        <button type="button" className={cx(styles.cardButton)}>
          Read the notes
        </button>
      </div>
    </Example>
  );
}
