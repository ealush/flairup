import React from 'react';
import { cx } from 'flairup';
import { stylesheet } from '../app/stylesheet';

const styles = stylesheet.create({
  featureItem: {
    backgroundColor: 'var(--card-background)',
    padding: '15px',
    borderRadius: '5px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  },
  featureTitle: {
    fontSize: '1.3em',
    fontWeight: 'bold',
    marginBottom: '0.5em',
    color: '#3498db',
  },
  featureDescription: {
    color: 'var(--card-text)',
  },
});

interface FeatureProps {
  title: string;
  children: React.ReactNode;
}

export function Feature({ title, children }: FeatureProps) {
  return (
    <div className={cx(styles.featureItem)}>
      <h3 className={cx(styles.featureTitle)}>{title}</h3>
      <p className={cx(styles.featureDescription)}>{children}</p>
    </div>
  );
}
