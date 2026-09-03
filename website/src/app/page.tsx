import React from 'react';
import { cx } from 'flairup';
import { createSheet } from 'flairup';
import { SiteNav } from '../components/SiteNav';
import { Sidebar } from '../components/Sidebar';
import { Section } from '../components/Section';
import { Code } from '../components/Code';
import { HeroDemo } from '../components/HeroDemo';
import { heroDemoClasses } from '../components/HeroDemoStyles';
import { Introduction } from '../components/Introduction';
import { CoreConcepts } from '../components/CoreConcepts';
import { Features } from '../components/Features';
import { ApiReference } from '../components/ApiReference';
import {
  BasicUsage,
  CSSVariables,
  MediaQueries,
  PseudoSelectors,
  ParentClassSupport,
  Keyframes,
  StylingVariantsAndScopes,
} from '../examples';

const sheet = createSheet('page');

const styles = sheet.create({
  hero: {
    backgroundColor: 'var(--code-bg)',
    color: 'var(--on-dark-fg)',
  },
  heroInner: {
    maxWidth: 'var(--measure)',
    margin: '0 auto',
    padding: '4rem 1.25rem 4.5rem',
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '2.5rem',
    alignItems: 'center',
    '@media (min-width: 900px)': {
      gridTemplateColumns: '1.05fr 1fr',
    },
  },
  eyebrow: {
    fontSize: '0.85rem',
    fontWeight: '650',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: 'var(--on-dark-accent)',
    marginBottom: '1rem',
  },
  title: {
    fontFamily: 'var(--font-display)',
    fontSize: '2.9rem',
    fontWeight: '700',
    lineHeight: '1.12',
    letterSpacing: '-0.01em',
    textWrap: 'balance',
    marginBottom: '1.1rem',
  },
  lede: {
    fontSize: '1.2rem',
    lineHeight: '1.65',
    color: 'var(--on-dark-muted)',
    maxWidth: '34rem',
    marginBottom: '1.75rem',
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.9rem',
    flexWrap: 'wrap',
    marginBottom: '1.75rem',
  },
  install: {
    fontFamily: 'var(--font-code)',
    fontSize: '0.95rem',
    backgroundColor: 'var(--on-dark-panel)',
    color: 'var(--on-dark-fg)',
    border: '1px solid var(--on-dark-muted)',
    padding: '0.65rem 1.1rem',
    borderRadius: '8px',
  },
  docsLink: {
    fontWeight: '600',
    color: 'var(--on-dark-btn-fg)',
    backgroundColor: 'var(--on-dark-btn-bg)',
    textDecoration: 'none',
    borderRadius: '8px',
    padding: '0.65rem 1.1rem',
    '&:hover': {
      color: 'var(--on-dark-btn-fg)',
      backgroundColor: 'var(--on-dark-fg)',
    },
  },
  proof: {
    color: 'var(--on-dark-muted)',
    fontSize: '0.95rem',
  },
  proofLink: {
    color: 'var(--on-dark-accent)',
  },
  content: {
    maxWidth: 'var(--measure)',
    margin: '0 auto',
    padding: '3.5rem 1.25rem 0',
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '2.5rem',
    '@media (min-width: 1024px)': {
      gridTemplateColumns: '220px minmax(0, 1fr)',
    },
  },
  article: {
    minWidth: '0',
  },
  examplesAnchor: {
    scrollMarginTop: '5rem',
  },
  prose: {
    maxWidth: '46rem',
    color: 'var(--muted)',
    marginBottom: '1em',
  },
  inlineCode: {
    fontFamily: 'var(--font-code)',
    fontSize: '0.88em',
    color: 'var(--ink)',
  },
  footer: {
    borderTop: '1px solid var(--line)',
    paddingTop: '2rem',
    paddingBottom: '3rem',
    color: 'var(--muted)',
    fontSize: '0.95rem',
    display: 'flex',
    gap: '1.5rem',
    flexWrap: 'wrap',
  },
});

function Hero() {
  return (
    <div className={cx(styles.hero)}>
      <div className={cx(styles.heroInner)}>
        <div>
          <p className={cx(styles.eyebrow)}>CSS-in-JS for component packages</p>
          <h1 className={cx(styles.title)}>
            Styles that ship with your components.
          </h1>
          <p className={cx(styles.lede)}>
            FlairUp is a lightweight CSS-in-JS library for UI package authors.
            No CSS files to import, no bundler plugins to configure — styles
            travel inside the JavaScript and work in any app, any bundler,
            and on the server.
          </p>
          <div className={cx(styles.actions)}>
            <code className={cx(styles.install)}>npm install flairup</code>
            <a href="#api" className={cx(styles.docsLink)}>
              Read the API reference
            </a>
          </div>
          <p className={cx(styles.proof)}>
            Used in production by{' '}
            <a
              href="https://github.com/ealush/emoji-picker-react"
              className={cx(styles.proofLink)}
            >
              Emoji-Picker-React
            </a>
            .
          </p>
        </div>
        <HeroDemo classes={heroDemoClasses} />
      </div>
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

function PageFooter() {
  return (
    <footer className={cx(styles.footer)}>
      <span>© {new Date().getFullYear()} ealush.</span>
      <a href="https://github.com/ealush/flairup">GitHub</a>
      <a href="https://www.npmjs.com/package/flairup">npm</a>
      <span>This page is styled with FlairUp.</span>
    </footer>
  );
}

export default function Home() {
  return (
    <div id="top">
      <SSRStyles />
      <SiteNav />
      <Hero />
      <div className={cx(styles.content)}>
        <Sidebar />
        <main id="main" className={cx(styles.article)}>
          <Section
            id="problem"
            kicker="01 · The problem"
            title="Why packages need their own styling"
          >
            <Introduction />
          </Section>

          <Section
            id="concepts"
            kicker="02 · Concepts"
            title="Core concepts"
          >
            <CoreConcepts />
          </Section>

          <Section
            id="features"
            kicker="03 · Features"
            title="Built for shipping"
          >
            <Features />
          </Section>

          <Section
            id="installation"
            kicker="04 · Install"
            title="Installation"
          >
            <Code language="bash" label="Install FlairUp">
              {`npm install flairup
# or
yarn add flairup`}
            </Code>
          </Section>

          <Section id="api" kicker="05 · API" title="API reference">
            <ApiReference />
          </Section>

          <div id="examples" className={cx(styles.examplesAnchor)}>
            <Section id="example-basic" kicker="06 · Examples" title="Basic usage">
              <BasicUsage />
            </Section>

            <Section id="example-variants" title="Variants and scopes">
              <StylingVariantsAndScopes />
            </Section>

            <Section id="example-variables" title="CSS variables">
              <CSSVariables />
            </Section>

            <Section id="example-media" title="Media queries">
              <MediaQueries />
            </Section>

            <Section id="example-pseudo" title="Pseudo selectors and elements">
              <PseudoSelectors />
            </Section>

            <Section id="example-parents" title="Parent selectors">
              <ParentClassSupport />
            </Section>

            <Section id="example-keyframes" title="Keyframe animations">
              <Keyframes />
            </Section>
          </div>

          <Section
            id="ssr"
            kicker="07 · SSR"
            title="Server-side rendering"
          >
            <p className={cx(styles.prose)}>
              On the server there is no DOM to inject into, so create the
              sheet detached and read the CSS out as a string:
            </p>
            <Code language="typescript" label="SSR pattern">
              {`import { createSheet } from 'flairup';

// null root: no <style> tag is touched, styles stay in memory
const sheet = createSheet('my-package', null);
renderMyComponents();

// inline the result wherever the server renders <head>
const css = sheet.getStyle();
// <style>{css}</style>`}
            </Code>
            <p className={cx(styles.prose)}>
              The same calls run unchanged in the browser, where the sheet
              mounts a{' '}
              <code className={cx(styles.inlineCode)}>{'<style>'}</code>{' '}
              tag and keeps it in sync. This very page renders its
              stylesheets this way.
            </p>
          </Section>

          <PageFooter />
        </main>
      </div>
    </div>
  );
}
