import React from 'react';
import { cx } from 'flairup';
import { stylesheet } from '../app/stylesheet';
import { Section } from './Section';

const styles = stylesheet.create({
  introContainer: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '2em',
    '@media (min-width: 768px)': {
      gridTemplateColumns: '1fr 1fr',
    },
  },
  introText: {
    fontSize: '1.1em',
    lineHeight: '1.6',
    color: '#444',
  },
  introList: {
    margin: '0.5em 0',
    paddingLeft: '1.2em',
    listStyleType: 'none',
  },
  introListItem: {
    marginBottom: '0.5em',
    lineHeight: '1.5',
    position: 'relative',
    paddingLeft: '1.2em',
    '&::before': {
      content: '→',
      position: 'absolute',
      left: '0',
      color: '#3498db',
      fontSize: '0.9em',
    },
  },
  introLink: {
    color: '#3498db',
    textDecoration: 'none',
    fontWeight: '500',
    '&:hover': {
      textDecoration: 'underline',
    },
  },
  introCard: {
    backgroundColor: '#fff',
    padding: '1.5em',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    border: '1px solid #eee',
  },
  introTitle: {
    fontSize: '1.2em',
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: '1em',
    display: 'flex',
    alignItems: 'center',
    '&::before': {
      content: '🎩',
      marginRight: '0.5em',
    },
  },
});

interface IntroTextProps {
  children: React.ReactNode;
}

function IntroText({ children }: IntroTextProps) {
  return <p className={cx(styles.introText)}>{children}</p>;
}

interface IntroTitleProps {
  children: React.ReactNode;
}

function IntroTitle({ children }: IntroTitleProps) {
  return <h3 className={cx(styles.introTitle)}>{children}</h3>;
}

interface IntroListItemProps {
  children: React.ReactNode;
}

function IntroListItem({ children }: IntroListItemProps) {
  return <li className={cx(styles.introListItem)}>{children}</li>;
}

interface IntroCardProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
}

function IntroCard({ children, style }: IntroCardProps) {
  return (
    <div className={cx(styles.introCard)} style={style}>
      {children}
    </div>
  );
}

export function Introduction() {
  return (
    <Section title="Introduction">
      <div className={cx(styles.introContainer)}>
        <IntroCard>
          <IntroTitle>What is Flairup?</IntroTitle>
          <IntroText>
            Flairup is a CSS-in-JS library specifically designed for UI package
            authors. Unlike general CSS-in-JS solutions, Flairup focuses on
            solving the unique challenges of distributing reusable UI components
            with their styles.
          </IntroText>
        </IntroCard>

        <IntroCard>
          <IntroTitle>The Challenge</IntroTitle>
          <IntroText>
            When creating third-party packages, you face different challenges
            than when building applications. Most existing styling solutions are
            designed for applications, not for packages meant to be shared and
            consumed by others.
          </IntroText>
        </IntroCard>

        <IntroCard>
          <IntroTitle>Common Problems</IntroTitle>
          <ul className={cx(styles.introList)}>
            <IntroListItem>
              <strong>Manual Style Imports:</strong> Users often need to
              manually import CSS files or configure style loaders, creating
              friction in the adoption process.
            </IntroListItem>
            <IntroListItem>
              <strong>Bundler Configuration:</strong> Different bundlers
              (Webpack, Rollup, Vite) require different configurations for
              handling styles, making it hard to create universally compatible
              packages.
            </IntroListItem>
            <IntroListItem>
              <strong>Style Conflicts:</strong> When multiple packages use the
              same class names or CSS variables, styles can conflict and
              override each other unexpectedly.
            </IntroListItem>
            <IntroListItem>
              <strong>SSR Challenges:</strong> Server-side rendering often
              requires special handling for styles, with solutions varying
              between frameworks and environments.
            </IntroListItem>
          </ul>
        </IntroCard>

        <IntroCard>
          <IntroTitle>{"Flairup's Solution"}</IntroTitle>
          <ul className={cx(styles.introList)}>
            <IntroListItem>
              Requiring zero configuration from package consumers
            </IntroListItem>
            <IntroListItem>
              Working seamlessly with all bundlers and environments
            </IntroListItem>
            <IntroListItem>
              Automatically scoping styles to prevent conflicts
            </IntroListItem>
            <IntroListItem>Providing built-in SSR support</IntroListItem>
            <IntroListItem>
              Optimizing performance with one class per CSS property
            </IntroListItem>
          </ul>
        </IntroCard>
      </div>

      <IntroCard style={{ marginTop: '2em' }}>
        <IntroText>
          Battle-tested on{' '}
          <a
            href="https://github.com/ealush/emoji-picker-react"
            className={cx(styles.introLink)}
          >
            Emoji-Picker-React
          </a>
          , Flairup makes it easy to ship styles with your components while
          ensuring they work reliably in any environment.
        </IntroText>
      </IntroCard>
    </Section>
  );
}
