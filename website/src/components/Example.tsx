import React from 'react';
import { cx } from 'flairup';
import { stylesheet } from '../app/stylesheet';
import { Code } from './Code';

const styles = stylesheet.create({
  container: {
    marginBottom: '2em',
  },
  title: {
    fontSize: '1.2em',
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: '0.5em',
  },
  description: {
    color: '#666',
    marginBottom: '1em',
    lineHeight: '1.5',
  },
  example: {
    backgroundColor: '#fff',
    padding: '1.5em',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    border: '1px solid #eee',
    marginBottom: '1em',
  },
  codeSection: {
    marginTop: '1em',
  },
  codeTitle: {
    fontSize: '1em',
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: '0.5em',
  },
});

interface ExampleProps {
  title: string;
  description: string;
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
      <p className={cx(styles.description)}>{description}</p>
      <div className={cx(styles.example)}>{children}</div>
      <div className={cx(styles.codeSection)}>
        <h4 className={cx(styles.codeTitle)}>Styles</h4>
        <Code language="typescript">{getCode()}</Code>
      </div>
      {usage && (
        <div className={cx(styles.codeSection)}>
          <h4 className={cx(styles.codeTitle)}>Usage</h4>
          <Code language="jsx">{usage}</Code>
        </div>
      )}
    </div>
  );
}
