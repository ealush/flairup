import React from 'react';
import { cx } from 'flairup';
import { stylesheet } from '../app/stylesheet';
import { Section } from './Section';
import { Code } from './Code';

const styles = stylesheet.create({
  coreConcepts: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    marginBottom: '40px',
  },
  coreConceptCard: {
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
  introText: {
    fontSize: '1.1em',
    lineHeight: '1.6',
    color: '#444',
  },
});

export function CoreConcepts() {
  return (
    <Section title="Core Concepts">
      <div className={cx(styles.coreConcepts)}>
        <div className={cx(styles.coreConceptCard)}>
          <h3 className={cx(styles.introTitle)}>The StyleSheet Singleton</h3>
          <p className={cx(styles.introText)}>
            At the heart of FlairUp is the StyleSheet object, which serves as a
            singleton for your entire package. This means that all styles across
            your library share the same stylesheet instance, allowing for
            efficient style deduplication and management.
          </p>
          <p className={cx(styles.introText)}>
            The StyleSheet is created once using the `createSheet` function and
            can be used throughout your package. All styles defined using this
            stylesheet will be automatically deduplicated, ensuring optimal
            performance and minimal CSS output.
          </p>
          <Code language="typescript">
            {`import { createSheet } from 'flairup';

// Create a stylesheet for your package
const stylesheet = createSheet('MyPackageName');

// Use the stylesheet to create styles
const styles = stylesheet.create({
  button: {
    color: 'red',
    ':hover': {
      color: 'blue',
    },
  },
});`}
          </Code>
        </div>

        <div className={cx(styles.coreConceptCard)}>
          <h3 className={cx(styles.introTitle)}>One Class Per Property</h3>
          <p className={cx(styles.introText)}>
            FlairUp optimizes performance by generating a single class for each
            unique CSS property value. This means that if the same style is used
            in multiple places, it will only be added to the stylesheet once.
          </p>
          <p className={cx(styles.introText)}>
            For example, if you use the color &apos;red&apos; in multiple
            components, FlairUp will create a single class for it and reuse it
            across all instances, reducing the overall CSS bundle size.
          </p>
        </div>

        <div className={cx(styles.coreConceptCard)}>
          <h3 className={cx(styles.introTitle)}>Style Tag Injection</h3>
          <p className={cx(styles.introText)}>
            FlairUp works by injecting a single {'<style>'} tag into the DOM.
            This tag contains all the styles for your package, and it is
            automatically managed by FlairUp.
          </p>
          <p className={cx(styles.introText)}>
            During server-side rendering, FlairUp ensures that the styles are
            properly injected into the HTML, and on the client side, it manages
            the style tag to prevent duplicate injections.
          </p>
        </div>
      </div>
    </Section>
  );
}
