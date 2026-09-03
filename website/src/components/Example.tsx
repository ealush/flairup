import React from 'react';
import { cx } from 'flairup';
import { stylesheet } from '../app/stylesheet';
import { Code } from './Code';
import { ExampleTabs, type ExampleTabClasses } from './ExampleTabs';

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
  card: {
    border: '1px solid var(--line)',
    borderRadius: 'var(--radius)',
    overflow: 'hidden',
    backgroundColor: 'var(--paper)',
  },
});

// Tab chrome lives here, in the server module graph, so its rules are
// part of the inlined stylesheet. The client <ExampleTabs> below only
// receives the resolved class strings (Sets are not serializable).
const tabStyles = stylesheet.create({
  tabs: {
    display: 'flex',
    gap: '0.25rem',
    borderBottom: '1px solid var(--line)',
    padding: '0 1em',
    backgroundColor: 'var(--paper)',
  },
  tabIdle: {
    font: 'inherit',
    fontSize: '0.9rem',
    fontWeight: '600',
    color: 'var(--muted)',
    backgroundColor: 'transparent',
    border: 'none',
    borderBottom: '2px solid transparent',
    marginBottom: '-1px',
    padding: '0.7em 0.9em',
    cursor: 'pointer',
    '&:hover': {
      color: 'var(--ink)',
    },
  },
  tabSelected: {
    font: 'inherit',
    fontSize: '0.9rem',
    fontWeight: '600',
    color: 'var(--accent)',
    backgroundColor: 'transparent',
    border: 'none',
    borderBottom: '2px solid var(--accent)',
    marginBottom: '-1px',
    padding: '0.7em 0.9em',
    cursor: 'pointer',
    '&:hover': {
      color: 'var(--accent)',
    },
  },
  panel: {
    padding: '1.25em 1.5em',
  },
  codePanel: {
    backgroundColor: 'var(--code-bg)',
    padding: '0.25em 1.25em',
    overflowX: 'auto',
  },
});

const tabClasses: ExampleTabClasses = {
  tabs: cx(tabStyles.tabs),
  tabIdle: cx(tabStyles.tabIdle),
  tabSelected: cx(tabStyles.tabSelected),
  panel: cx(tabStyles.panel),
  codePanel: cx(tabStyles.codePanel),
};

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
      <div className={cx(styles.card)}>
        <ExampleTabs
          title={title}
          classes={tabClasses}
          preview={children}
          stylesCode={
            <Code language="typescript" label={`Styles for ${title}`}>
              {getCode()}
            </Code>
          }
          usageCode={
            usage ? (
              <Code language="jsx" label={`Usage for ${title}`}>
                {usage}
              </Code>
            ) : undefined
          }
        />
      </div>
    </div>
  );
}
