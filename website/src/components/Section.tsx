import React from 'react';
import { cx } from 'flairup';
import { stylesheet } from '../app/stylesheet';

const styles = stylesheet.create({
  section: {
    marginBottom: '60px',
    paddingBottom: '40px',
    borderBottom: '1px solid #eee',
    '&:last-child': {
      borderBottom: 'none',
      marginBottom: '0',
    },
  },
  usageTitle: {
    fontSize: '1.8em',
    fontWeight: 'bold',
    marginBottom: '1.2em',
    color: '#2c3e50',
    position: 'relative',
    '&::after': {
      content: '',
      position: 'absolute',
      bottom: '-10px',
      left: '0',
      width: '50px',
      height: '3px',
      backgroundColor: '#3498db',
      borderRadius: '2px',
    },
  },
});

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

export function Section({ title, children }: SectionProps) {
  return (
    <section className={cx(styles.section)}>
      <h2 className={cx(styles.usageTitle)}>{title}</h2>
      {children}
    </section>
  );
}
