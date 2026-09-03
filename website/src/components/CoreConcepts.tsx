import React from 'react';
import { cx } from 'flairup';
import { stylesheet } from '../app/stylesheet';
import { Code } from './Code';

const styles = stylesheet.create({
  list: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '2em',
    '@media (min-width: 860px)': {
      gridTemplateColumns: '1fr 1fr',
    },
  },
  itemTitle: {
    fontSize: '1.1rem',
    fontWeight: '650',
    marginBottom: '0.5em',
  },
  itemText: {
    color: 'var(--muted)',
  },
  itemTextCode: {
    fontFamily: 'var(--font-code)',
    fontSize: '0.9em',
    color: 'var(--ink)',
  },
});

const concepts: Array<{ title: string; body: React.ReactNode }> = [
  {
    title: 'One sheet per name',
    body: (
      <>
        <code className={cx(styles.itemTextCode)}>createSheet(&apos;name&apos;)</code>{' '}
        gives a package its own stylesheet. Identical declarations
        deduplicate into a single class, so popular styles cost nothing
        extra no matter how many components use them.
      </>
    ),
  },
  {
    title: 'Atomic classes, composed with cx()',
    body: (
      <>
        Every scope returns a set of classes — one per declaration. Pass
        sets, strings, arrays, and{' '}
        <code className={cx(styles.itemTextCode)}>{'{ name: boolean }'}</code>{' '}
        maps to <code className={cx(styles.itemTextCode)}>cx()</code> and get
        one class string back.
      </>
    ),
  },
  {
    title: 'Conditions travel with the style',
    body: (
      <>
        Pseudo selectors, parent markers, media queries, and CSS variables
        live inside the style object next to the declarations they modify.
        No separate files, no selector bookkeeping.
      </>
    ),
  },
  {
    title: 'SSR is just a string',
    body: (
      <>
        <code className={cx(styles.itemTextCode)}>sheet.getStyle()</code>{' '}
        returns the full stylesheet as text. Create the sheet with a{' '}
        <code className={cx(styles.itemTextCode)}>null</code> root on the
        server, inject the string into a{' '}
        <code className={cx(styles.itemTextCode)}>{'<style>'}</code> tag,
        and the client continues from the same CSS.
      </>
    ),
  },
];

export function CoreConcepts() {
  return (
    <div>
      <div className={cx(styles.list)}>
        {concepts.map((concept) => (
          <div key={concept.title}>
            <h3 className={cx(styles.itemTitle)}>{concept.title}</h3>
            <p className={cx(styles.itemText)}>{concept.body}</p>
          </div>
        ))}
      </div>
      <Code language="typescript" label="Core FlairUp loop">
        {`import { createSheet, cx } from 'flairup';

const sheet = createSheet('my-package');

const styles = sheet.create({
  button: {
    padding: '8px 16px',
    borderRadius: '6px',
    '&:hover': {
      backgroundColor: '#eee',
    },
  },
  primary: {
    backgroundColor: '#a31621',
    color: '#fff',
  },
});

function Button({ primary, className }) {
  return (
    <button className={cx(styles.button, primary && styles.primary, className)}>
      Click me
    </button>
  );
}`}
      </Code>
    </div>
  );
}
