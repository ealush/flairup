import React from 'react';
import { cx } from 'flairup';
import { createSheet } from 'flairup';
import { Section } from '../components/Section';
import { Code } from '../components/Code';
import { Introduction } from '../components/Introduction';
import { CoreConcepts } from '../components/CoreConcepts';
import { Features } from '../components/Features';
import {
  BasicUsage,
  CSSVariables,
  MediaQueries,
  PseudoSelectors,
  ParentClassSupport,
  Keyframes,
  StylingVariantsAndScopes,
} from '../examples';

// --- Flairup Styles ---
const sheet = createSheet('page');

// --- Main Page Component ---
export default function Home() {
  return (
    <div className={cx(styles.container)}>
      <SSRStyles />
      <Header />

      <Introduction />
      <CoreConcepts />
      <Features />

      <Section title="Installation">
        <Code language="bash">
          {`npm install flairup
# or
yarn add flairup`}
        </Code>
      </Section>

      <Section title="Basic Usage">
        <BasicUsage />
      </Section>

      <Section title="Styling Variants and Scopes">
        <StylingVariantsAndScopes />
      </Section>

      <Section title="CSS Variables">
        <CSSVariables />
      </Section>

      <Section title="Media Queries">
        <MediaQueries />
      </Section>

      <Section title="Pseudo Selectors & Elements">
        <PseudoSelectors />
      </Section>

      <Section title="Parent Class Support">
        <ParentClassSupport />
      </Section>

      <Section title="Keyframes Animations">
        <Keyframes />
      </Section>

      <Footer />
    </div>
  );
}

function SSRStyles() {
  return (
    <style
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: sheet.getStyle() }}
    />
  );
}

function Header() {
  return (
    <header className={cx(styles.header)}>
      <h1 className={cx(styles.title)}>🎩 Flairup</h1>
      <p className={cx(styles.tagline)}>
        A CSS-in-JS library for UI package authors
      </p>
      <div className={cx(styles.headerLinks)}>
        <a
          href="https://github.com/ealush/flairup"
          target="_blank"
          rel="noopener noreferrer"
          className={cx(styles.headerLink)}
        >
          <svg height="20" width="20" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path>
          </svg>
          GitHub
        </a>
        <a
          href="https://www.npmjs.com/package/flairup"
          target="_blank"
          rel="noopener noreferrer"
          className={cx(styles.headerLink)}
        >
          <svg height="20" width="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M0 7.334v8h6.666v1.332H12v-1.332h12v-8H0zm6.666 6.668H5.334v-4H3.999v4H1.335V8.667h5.331v5.335zm4 0v1.336H8.001V8.667h5.334v5.332h-2.669v-.001zm12.001 0h-1.33v-4h-1.336v4h-1.335v-4h-1.33v4h-2.671V8.667h8.002v5.335zM10.665 10H12v2.667h-1.335V10z" />
          </svg>
          npm
        </a>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className={cx(styles.footer)}>
      <p>© {new Date().getFullYear()} ealush. All rights reserved.</p>
    </footer>
  );
}

const styles = sheet.create({
  container: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '20px',
  },
  header: {
    textAlign: 'center',
    marginBottom: '40px',
  },
  title: {
    fontSize: '2.5em',
    color: '#e91e63',
    marginBottom: '10px',
  },
  tagline: {
    fontSize: '1.2em',
    color: 'var(--card-text)',
  },
  footer: {
    textAlign: 'center',
    marginTop: '40px',
    padding: '20px',
    borderTop: '1px solid #eee',
  },
  section: {
    marginBottom: '40px',
  },
  usageTitle: {
    fontSize: '1.5em',
    fontWeight: 'bold',
    marginBottom: '1em',
  },
  install: {
    backgroundColor: '#333',
    color: '#fff',
    padding: '10px 15px',
    borderRadius: '5px',
    display: 'inline-block',
    marginBottom: '1em',
  },
  codeExample: {
    backgroundColor: '#f5f5f5',
    padding: '15px',
    borderRadius: '5px',
    overflowX: 'auto',
    margin: '1em 0',
  },
  headerLinks: {
    display: 'flex',
    justifyContent: 'center',
    gap: '20px',
    marginTop: '10px',
  },
  headerLink: {
    color: '#3498db',
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    '&:hover': {
      textDecoration: 'underline',
    },
  },
});
