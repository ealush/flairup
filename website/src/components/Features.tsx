import React from 'react';
import { cx } from 'flairup';
import { stylesheet } from '../app/stylesheet';

const styles = stylesheet.create({
  list: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '1.75em',
    '@media (min-width: 860px)': {
      gridTemplateColumns: '1fr 1fr',
    },
  },
  item: {
    borderTop: '2px solid var(--line)',
    paddingTop: '1em',
  },
  title: {
    fontSize: '1.05rem',
    fontWeight: '650',
    marginBottom: '0.35em',
  },
  text: {
    color: 'var(--muted)',
  },
});

const features: Array<[string, string]> = [
  ['2 KB runtime, zero dependencies', 'Small enough to bundle into any package without a second thought.'],
  ['TypeScript throughout', 'Style objects are typed; scopes come back as named sets of classes.'],
  ['Scoped by construction', 'Hashed atomic classes mean two packages never fight over a name.'],
  ['Framework-agnostic SSR', 'Styles render to a string anywhere JavaScript runs — no DOM required.'],
];

export function Features() {
  return (
    <div className={cx(styles.list)}>
      {features.map(([title, text]) => (
        <div key={title} className={cx(styles.item)}>
          <h3 className={cx(styles.title)}>{title}</h3>
          <p className={cx(styles.text)}>{text}</p>
        </div>
      ))}
    </div>
  );
}
