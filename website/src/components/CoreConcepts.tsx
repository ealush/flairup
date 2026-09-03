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
  itemIndex: {
    fontFamily: 'var(--font-display)',
    fontSize: '0.95rem',
    fontWeight: '700',
    color: 'var(--accent)',
    marginBottom: '0.35em',
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
    title: 'One sheet per name and target',
    body: (
      <>
        <code className={cx(styles.itemTextCode)}>createSheet(&apos;name&apos;)</code>{' '}
        gives a package its own stylesheet; calls with the same name and
        mount target share it. A{' '}
        <code className={cx(styles.itemTextCode)}>null</code> root always
        creates an isolated sheet, so server requests never share styles.
        Identical declarations deduplicate into a single class, so popular
        styles cost nothing extra no matter how many components use them.
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
        {concepts.map((concept, index) => (
          <div key={concept.title}>
            <p aria-hidden="true" className={cx(styles.itemIndex)}>
              {String(index + 1).padStart(2, '0')}
            </p>
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
    color: '#fff',
    backgroundColor: '#9c1a24',
    padding: '10px 20px',
    borderRadius: '8px',
    '&:hover': {
      backgroundColor: '#7e1420',
    },
  },
  block: {
    display: 'block',
    width: '100%',
  },
});

function Button({ block, className }) {
  return (
    <button className={cx(styles.button, block && styles.block, className)}>
      Save changes
    </button>
  );
}`}
      </Code>
    </div>
  );
}
