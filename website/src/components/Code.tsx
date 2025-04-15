import React from 'react';
import { cx } from 'flairup';
import { stylesheet } from '../app/stylesheet';
import { Highlight, themes } from 'prism-react-renderer';

const styles = stylesheet.create({
  codeExample: {
    backgroundColor: '#f5f5f5',
    padding: '15px',
    borderRadius: '5px',
    overflowX: 'auto',
    margin: '1em 0',
    fontFamily: 'monospace',
  },
  pre: {
    margin: '0',
    padding: '0',
  },
  line: {
    display: 'table-row',
  },
  lineNumber: {
    display: 'table-cell',
    textAlign: 'right',
    paddingRight: '1em',
    userSelect: 'none',
    opacity: '0.5',
  },
  lineContent: {
    display: 'table-cell',
  },
});

interface CodeProps {
  children: string;
  language?: string;
}

export function Code({ children, language = 'typescript' }: CodeProps) {
  return (
    <Highlight
      theme={themes.github}
      code={children.trim()}
      language={language}
    >
      {({ className, style, tokens, getLineProps, getTokenProps }) => (
        <pre className={cx(styles.codeExample, className)} style={style}>
          {tokens.map((line, i) => (
            <div key={i} {...getLineProps({ line })} className={cx(styles.line)}>
              <span className={cx(styles.lineNumber)}>{i + 1}</span>
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
  );
} 