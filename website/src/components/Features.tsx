import React from 'react';
import { cx } from 'flairup';
import { stylesheet } from '../app/stylesheet';
import { Section } from './Section';
import { Feature } from './Feature';

const styles = stylesheet.create({
  features: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
    marginBottom: '40px',
  },
});

export function Features() {
  return (
    <Section title="Features">
      <div className={cx(styles.features)}>
        <Feature title="Simple API">
          Easy to use with a familiar CSS-like syntax
        </Feature>
        <Feature title="TypeScript Support">
          Full TypeScript support for better development experience
        </Feature>
        <Feature title="Scoped Styles">
          Automatic style scoping to prevent conflicts
        </Feature>
        <Feature title="SSR Ready">
          Built-in support for server-side rendering
        </Feature>
      </div>
    </Section>
  );
} 