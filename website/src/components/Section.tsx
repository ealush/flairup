import React from 'react';
import { cx } from 'flairup';
import { stylesheet } from '../app/stylesheet';

const styles = stylesheet.create({
  section: {
    marginBottom: '4.5rem',
    scrollMarginTop: '5rem',
  },
  title: {
    fontFamily: 'var(--font-display)',
    fontSize: '1.75rem',
    fontWeight: '700',
    lineHeight: '1.25',
    marginBottom: '1.5rem',
    color: 'var(--ink)',
  },
});

interface SectionProps {
  id: string;
  title: string;
  children: React.ReactNode;
}

export function Section({ id, title, children }: SectionProps) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className={cx(styles.section)}>
      <h2 id={`${id}-title`} className={cx(styles.title)}>
        {title}
      </h2>
      {children}
    </section>
  );
}
