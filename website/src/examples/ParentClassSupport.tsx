import React from 'react';
import { cx } from 'flairup';
import { stylesheet } from '../app/stylesheet';
import { Example } from '../components/Example';

const exampleStyle = {
  '.theme-dark': {
    plan: {
      backgroundColor: '#241c13',
      borderColor: '#4a3f30',
      color: '#f2eada',
    },
    planPrice: {
      color: '#f2eada',
    },
    planFeatures: {
      color: '#c9bda6',
    },
    planButton: {
      backgroundColor: '#ec9aae',
      color: '#2a1216',
      '&:hover': {
        backgroundColor: '#f6c2cf',
      },
    },
  },
  plans: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '12px',
    '@media (min-width: 640px)': {
      gridTemplateColumns: '1fr 1fr',
    },
  },
  plan: {
    backgroundColor: 'var(--paper)',
    border: '1px solid var(--line)',
    borderRadius: '8px',
    padding: '20px',
    color: 'var(--ink)',
  },
  planName: {
    fontWeight: '650',
    fontSize: '0.95rem',
    color: 'var(--accent)',
    marginBottom: '0.25em',
  },
  planPrice: {
    fontFamily: 'var(--font-display)',
    fontSize: '1.75rem',
    fontWeight: '700',
    color: 'var(--ink)',
    marginBottom: '0.35em',
  },
  planFeatures: {
    color: 'var(--muted)',
    fontSize: '0.95rem',
    marginTop: '0',
    marginBottom: '1em',
    paddingLeft: '1.2em',
  },
  planButton: {
    fontFamily: 'inherit',
    lineHeight: 'inherit',
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
  },
};

const styles = stylesheet.create({
  ...exampleStyle,
});

function PlanCard({ name, price }: { name: string; price: string }) {
  return (
    <div className={cx(styles.plan)}>
      <p className={cx(styles.planName)}>{name}</p>
      <p className={cx(styles.planPrice)}>{price}</p>
      <ul className={cx(styles.planFeatures)}>
        <li>Unlimited projects</li>
        <li>Export to any format</li>
      </ul>
      <button className={cx(styles.planButton)}>Choose {name}</button>
    </div>
  );
}

export function ParentClassSupport() {
  return (
    <Example
      title="Parent selectors"
      description="Scope a whole subtree under a host class like .theme-dark. The same card renders light or dark depending on where it lands — handy when your component has to respect theming it doesn't own. The deeper idea is a contract: name the host classes your package responds to — .theme-dark, .density-compact — and document them. Consumers opt in by wrapping your components, no configuration objects or prop drilling required."
      exampleStyle={exampleStyle}
      usage={`function Pricing() {
  return (
    <div className={cx(styles.plans)}>
      <PlanCard name="Starter" price="$9" />
      {/* Same card, restyled by the host's theme class */}
      <div className="theme-dark">
        <PlanCard name="Pro" price="$29" />
      </div>
    </div>
  );
}`}
    >
      <div className={cx(styles.plans)}>
        <PlanCard name="Starter" price="$9" />
        <div className="theme-dark">
          <PlanCard name="Pro" price="$29" />
        </div>
      </div>
    </Example>
  );
}
