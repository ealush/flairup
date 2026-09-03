import React from 'react';
import { cx } from 'flairup';
import { stylesheet } from '../app/stylesheet';
import { Highlight, themes } from 'prism-react-renderer';

const styles = stylesheet.create({
  figure: {
    margin: '1.25em 0',
  },
  pre: {
    margin: '0',
    padding: '1rem 1.1rem',
    backgroundColor: 'var(--code-bg)',
    color: 'var(--code-fg)',
    borderRadius: 'var(--radius)',
    overflowX: 'auto',
    fontFamily: 'var(--font-code)',
    fontSize: '0.85rem',
    lineHeight: '1.6',
  },
  line: {
    display: 'table-row',
  },
  lineNumber: {
    display: 'table-cell',
    textAlign: 'right',
    paddingRight: '1.1em',
    userSelect: 'none',
    opacity: '0.45',
  },
  lineContent: {
    display: 'table-cell',
    whiteSpace: 'pre',
  },
});

interface CodeProps {
  children: string;
  language?: string;
  label?: string;
}

export function Code({ children, language = 'typescript', label }: CodeProps) {
  return (
    <figure className={cx(styles.figure)}>
      <Highlight
        theme={themes.nightOwl}
        code={children.trim()}
        language={language}
      >
        {({ className, style, tokens, getLineProps, getTokenProps }) => (
          <pre
            className={cx(styles.pre, className)}
            style={style}
            tabIndex={0}
            role="region"
            aria-label={label ?? `Code sample (${language})`}
          >
            {tokens.map((line, i) => (
              <div
                key={i}
                {...getLineProps({ line })}
                className={cx(styles.line)}
              >
                <span aria-hidden="true" className={cx(styles.lineNumber)}>
                  {i + 1}
                </span>
                <span className={cx(styles.lineContent)}>
                  {line.map((token, key) => (
                    <span key={key} {...getTokenProps({ token })} />
                  ))}
                </span>
              </div>
            ))}
          </pre>
        )}
      </Highlight>
    </figure>
  );
}
