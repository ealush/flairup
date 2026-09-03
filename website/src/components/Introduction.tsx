import React from 'react';
import { cx } from 'flairup';
import { stylesheet } from '../app/stylesheet';

const styles = stylesheet.create({
  lede: {
    fontSize: '1.2rem',
    lineHeight: '1.7',
    maxWidth: '44rem',
    marginBottom: '2.5em',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '2.5em',
    '@media (min-width: 860px)': {
      gridTemplateColumns: '1fr 1fr',
    },
  },
  groupTitle: {
    fontFamily: 'var(--font-display)',
    fontSize: '1.3rem',
    fontWeight: '700',
    marginBottom: '1em',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.4em',
  },
  term: {
    fontWeight: '650',
  },
  detail: {
    color: 'var(--muted)',
    marginTop: '0.25em',
  },
  proof: {
    marginTop: '2.5em',
    paddingTop: '1.5em',
    borderTop: '1px solid var(--line)',
    color: 'var(--muted)',
    maxWidth: '44rem',
  },
});

const problems: Array<[string, string]> = [
  [
    'Manual style imports',
    'Consumers have to import CSS files or configure style loaders before a single component renders. Every extra setup step loses adopters.',
  ],
  [
    'Bundler-specific configuration',
    'Webpack, Rollup, Vite and others each handle styles differently. A package that works everywhere needs styling with no build pipeline at all.',
  ],
  [
    'Style conflicts',
    'Shared class names and CSS variables leak across packages. Two dependencies can silently override each other with no warning.',
  ],
  [
    'SSR as an afterthought',
    'Server rendering needs the same styles as strings, in every framework, with no DOM available. Most solutions bolt this on late — or never.',
  ],
];

const answers: Array<[string, string]> = [
  [
    'Zero configuration',
    'Styles ship inside the JavaScript. Consumers install the package and render — nothing to import, nothing to configure.',
  ],
  [
    'No build pipeline',
    'FlairUp computes plain CSS at runtime and injects it once. It works under any bundler, or none.',
  ],
  [
    'Scoped atomic classes',
    'Every declaration becomes its own hashed, deduplicated class. Packages cannot collide, and repeated styles are inserted once.',
  ],
  [
    'SSR from day one',
    'sheet.getStyle() returns the whole stylesheet as a string. Render it into a <style> tag on the server; the client picks it up.',
  ],
];

function DefinitionList({ items }: { items: Array<[string, string]> }) {
  return (
    <dl className={cx(styles.list)}>
      {items.map(([term, detail]) => (
        <div key={term}>
          <dt className={cx(styles.term)}>{term}</dt>
          <dd className={cx(styles.detail)}>{detail}</dd>
        </div>
      ))}
    </dl>
  );
}

export function Introduction() {
  return (
    <div>
      <p className={cx(styles.lede)}>
        FlairUp is a CSS-in-JS library for UI package authors. Applications
        can dictate their stack; packages cannot — a shared component must
        bring its styles along and behave in bundlers, frameworks, and
        server runtimes it has never seen. FlairUp is designed for exactly
        that job.
      </p>
      <div className={cx(styles.grid)}>
        <div>
          <h3 className={cx(styles.groupTitle)}>The package problem</h3>
          <DefinitionList items={problems} />
        </div>
        <div>
          <h3 className={cx(styles.groupTitle)}>How FlairUp answers</h3>
          <DefinitionList items={answers} />
        </div>
      </div>
      <p className={cx(styles.proof)}>
        Battle-tested on{' '}
        <a href="https://github.com/ealush/emoji-picker-react">
          Emoji-Picker-React
        </a>
        , FlairUp ships styles with components while staying reliable in
        any environment.
      </p>
    </div>
  );
}
