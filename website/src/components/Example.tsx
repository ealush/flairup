import React from 'react';
import { cx } from 'flairup';
import { stylesheet } from '../app/stylesheet';
import { Code } from './Code';

const styles = stylesheet.create({
  container: {
    marginBottom: '2.5em',
  },
  title: {
    fontSize: '1.15rem',
    fontWeight: '650',
    color: 'var(--ink)',
    marginBottom: '0.4em',
  },
  description: {
    color: 'var(--muted)',
    marginBottom: '1em',
    maxWidth: '44rem',
  },
  demo: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '1px',
    backgroundColor: 'var(--line)',
    border: '1px solid var(--line)',
    borderRadius: 'var(--radius)',
    overflow: 'hidden',
    '@media (min-width: 900px)': {
      gridTemplateColumns: '1fr 1fr',
    },
  },
  preview: {
    backgroundColor: 'var(--card)',
    padding: '1.5em',
  },
  previewLabel: {
    fontSize: '0.8rem',
    fontWeight: '600',
    color: 'var(--muted)',
    marginBottom: '1em',
  },
  code: {
    backgroundColor: 'var(--code-bg)',
    padding: '0.25em 1.25em',
    overflowX: 'auto',
  },
});

interface ExampleProps {
  title: string;
  description: string | React.ReactNode;
  exampleStyle: Record<string, unknown> | string;
  children: React.ReactNode;
  usage?: string;
}

export function Example({
  title,
  description,
  exampleStyle,
  children,
  usage,
}: ExampleProps) {
  const getCode = () => {
    if (typeof exampleStyle === 'string') {
      return exampleStyle;
    }

    return `const styles = sheet.create(${JSON.stringify(exampleStyle, null, 2)});`;
  };

  return (
    <div className={cx(styles.container)}>
      <h3 className={cx(styles.title)}>{title}</h3>
      <div className={cx(styles.description)}>{description}</div>
      <div className={cx(styles.demo)}>
        <div className={cx(styles.preview)}>
          <p aria-hidden="true" className={cx(styles.previewLabel)}>
            Result
          </p>
          {children}
        </div>
        <div className={cx(styles.code)}>
          <Code language="typescript" label={`Styles for ${title}`}>
            {getCode()}
          </Code>
          {usage && (
            <Code language="jsx" label={`Usage for ${title}`}>
              {usage}
            </Code>
          )}
        </div>
      </div>
    </div>
  );
}
