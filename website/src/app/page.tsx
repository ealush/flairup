// src/app/page.tsx
'use client'; //  Since we're using useState, this must be a client component

import React, { useState, useEffect } from 'react';
import { createSheet, cx } from 'flairup';

// --- Flairup Styles ---
const sheet = createSheet('main');

const keyframes = sheet.keyframes({
  slideIn: {
    from: {
      opacity: '0',
      transform: 'translateX(-20px)',
    },
    to: {
      opacity: '1',
      transform: 'translateX(0)',
    },
  },
});

const styles = sheet.create({
  // --- Container & Layout ---
  container: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '20px',
  },
  section: {
    marginBottom: '40px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px',
  },

  // --- Header ---
  header: {
    textAlign: 'center',
    marginBottom: '2em',
  },
  title: {
    fontSize: '2.5em',
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  tagline: {
    fontSize: '1.2em',
    color: '#777',
  },

  // --- Intro ---
  intro: {
    fontSize: '1.1em',
    lineHeight: '1.8',
  },

  // --- Features ---
  features: {
    // styles for the Features section
  },
  featureItem: {
    backgroundColor: '#fff',
    padding: '15px',
    borderRadius: '5px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  },
  featureTitle: {
    fontSize: '1.3em',
    fontWeight: 'bold',
    marginBottom: '0.5em',
    color: '#3498db',
  },
  featureDescription: {
    color: '#555',
  },

  // --- Usage ---
  usage: {
    // styles for the Usage section
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
    // see global pre
  },

  // --- Footer ---
  footer: {
    textAlign: 'center',
    marginTop: '2em',
    paddingTop: '1em',
    borderTop: '1px solid #eee',
    color: '#888',
    fontSize: '0.9em',
  },

  // ---  Additional Styles (examples) ---
  button: {
    color: 'blue',
    backgroundColor: 'white',
    padding: '10px 20px',
    border: '1px solid blue',
    borderRadius: '5px',
    cursor: 'pointer',
    ':hover': {
      backgroundColor: 'lightblue',
      borderColor: 'darkblue',
    },
  },
  coolBox: {
    '--': {
      '--box-bg-color': 'lightgreen',
    },
    backgroundColor: 'var(--box-bg-color)',
    padding: '15px',
    borderRadius: '8px',
    margin: '10px 0',
  },
  error: {
    color: 'red',
  },
  mqExample: {
    color: 'purple',
    '@media (max-width: 600px)': {
      color: 'orange',
    },
  },
  pseudoExample: {
    color: 'teal',
    ':hover': {
      color: 'hotpink',
    },
  },
  nestingExample: {
    '.nested-text': {
      color: 'brown',
    },
  },
  cxExample: {
    fontSize: '1.5em',
    fontWeight: 'bold',
  },
  keyframesExample: {
    animation: `${keyframes.slideIn} infinite 1s ease-in-out`,
  },
});

function SSRStyles() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null; // Or a placeholder
  }

  if (sheet.isApplied()) {
    return null;
  }

  return (
    <style
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: sheet.getStyle() }}
    />
  );
}

// --- Main Page Component ---
export default function Home() {
  return (
    <div className={cx(styles.container)}>
      <SSRStyles />

      <header className={cx(styles.header)}>
        <h1 className={cx(styles.title)}>Flairup 🎩</h1>
        <p className={cx(styles.tagline)}>
          Lightweight CSS-In-JS library for UI packages.
        </p>
      </header>

      <section className={cx(styles.section)}>
        <h2 className={cx(styles.usageTitle)}>Introduction</h2>
        <p className={cx(styles.intro)}>
          Flairup is a CSS-in-JS library designed specifically for UI package
          authors. It addresses the challenges of shipping styles with
          third-party components in a way that avoids conflicts and requires
          minimal configuration for the consuming application. Unlike general
          CSS-in-JS solutions, Flairup focuses on the unique constraints of
          distributing reusable UI elements. It was battle tested on{' '}
          <a href="https://github.com/ealush/emoji-picker-react">
            Emoji-Picker-React
          </a>
          .
        </p>
      </section>

      <section className={cx(styles.section)}>
        <h2 className={cx(styles.usageTitle)}>Features</h2>
        <div className={cx(styles.grid)}>
          <div className={cx(styles.featureItem)}>
            <h3 className={cx(styles.featureTitle)}>Zero Config</h3>
            <p className={cx(styles.featureDescription)}>
              Flairup requires no complex setup. Styles are automatically
              applied, eliminating the need for manual imports or bundler
              configurations. This simplifies integration for users of your
              package.
            </p>
          </div>
          <div className={cx(styles.featureItem)}>
            <h3 className={cx(styles.featureTitle)}>One-Time Runtime</h3>
            <p className={cx(styles.featureDescription)}>
              Flairup's runtime overhead is minimal. Styles are injected into
              the DOM once when your component is imported, ensuring optimal
              performance.
            </p>
          </div>
          <div className={cx(styles.featureItem)}>
            <h3 className={cx(styles.featureTitle)}>Automatic Scoping</h3>
            <p className={cx(styles.featureDescription)}>
              Flairup generates unique class names, preventing style collisions
              between your component and the consuming application's styles.
            </p>
          </div>
          <div className={cx(styles.featureItem)}>
            <h3 className={cx(styles.featureTitle)}>CSS Features Support</h3>
            <p className={cx(styles.featureDescription)}>
              Flairup supports standard CSS features, including:
              <ul>
                <li>CSS Properties</li>
                <li>Pseudo-selectors (:hover, :focus, etc.)</li>
                <li>Media Queries</li>
                <li>CSS Variables</li>
              </ul>
            </p>
          </div>
          <div className={cx(styles.featureItem)}>
            <h3 className={cx(styles.featureTitle)}>Advanced Styling</h3>
            <p className={cx(styles.featureDescription)}>
              Flairup enables advanced styling techniques:
              <ul>
                <li>
                  <b>Preconditions:</b> Scope styles under a known class name.
                </li>
                <li>
                  <b>Postconditions:</b> Scope styles under a selector.
                </li>
                <li>
                  <b>Custom Class Names:</b> Add your own class names.
                </li>
              </ul>
            </p>
          </div>
          <div className={cx(styles.featureItem)}>
            <h3 className={cx(styles.featureTitle)}>SSR Support</h3>
            <p className={cx(styles.featureDescription)}>
              Flairup works seamlessly with Server-Side Rendering (SSR) in React
              applications (like Next.js), ensuring consistent styling on
              initial page load.
            </p>
          </div>
        </div>
      </section>

      <section className={cx(styles.section)}>
        <h2 className={cx(styles.usageTitle)}>Installation</h2>
        <code className={cx(styles.install)}>npm install flairup</code>
      </section>

      <section className={cx(styles.section)}>
        <h2 className={cx(styles.usageTitle)}>Usage</h2>
        <p>
          Here's a basic example of using Flairup to style a button component:
        </p>
        <pre className={cx(styles.codeExample)}>
          <code>
            {`
import { createSheet, cx } from 'flairup';

const sheet = createSheet('MyComponent');

const styles = sheet.create({
  button: {
    color: 'blue',
    backgroundColor: 'white',
    padding: '10px 20px',
    ':hover': {
      backgroundColor: 'lightblue',
    },
  },
});

function MyComponent() {
  return <button className={cx(styles.button)}>Click me</button>;
}
          `}
          </code>
        </pre>
        <button className={cx(styles.button)}>Click me</button>
      </section>

      <section className={cx(styles.section)}>
        <h2 className={cx(styles.usageTitle)}>Advanced Usage</h2>
        <p>
          Flairup provides powerful features for more complex styling scenarios:
        </p>

        <h3>Custom Class Names</h3>
        <p>
          You can add your own class names to Flairup styles. This can be useful
          for integration with existing CSS or libraries.
        </p>
        <pre className={cx(styles.codeExample)}>
          <code>
            {`
const styles = sheet.create({
  button: {
    '.': 'my-button', // or ["my-button", "button-main"]
    color: 'red',
  },
});
`}
          </code>
        </pre>

        <h3>CSS Variables</h3>
        <p>
          Flairup supports CSS variables, allowing for dynamic styling and
          theming.
        </p>
        <pre className={cx(styles.codeExample)}>
          <code>
            {`
const styles = sheet.create({
  coolBox: {
    '--': {
      '--box-bg-color': 'lightgreen',
    },
    backgroundColor: 'var(--box-bg-color)',
    padding: '15px',
    borderRadius: '8px',
  },
});
`}
          </code>
        </pre>
        <div className={cx(styles.coolBox)}>This is a cool box</div>

        <h3>Media Queries</h3>
        <p>
          Use media queries to create responsive designs that adapt to different
          screen sizes.
        </p>
        <pre className={cx(styles.codeExample)}>
          <code>
            {`
const styles = sheet.create({
  text: {
    color: 'purple',
    '@media (max-width: 600px)': {
      color: 'orange',
    },
  },
});
`}
          </code>
        </pre>
        <p className={cx(styles.mqExample)}>
          This text changes color on smaller screens.
        </p>

        <h3>Pseudo-selectors</h3>
        <p>Style elements based on their state (hover, focus, etc.)</p>
        <pre className={cx(styles.codeExample)}>
          <code>
            {`
const styles = sheet.create({
  link: {
    color: 'teal',
    ':hover': {
      color: 'hotpink',
    },
  },
});
`}
          </code>
        </pre>
        <a href="#" className={cx(styles.pseudoExample)}>
          Hover me
        </a>

        <h3>Nesting (Preconditions & Postconditions)</h3>
        <p>
          Nest styles under a parent class or within a selector for more
          specific targeting.
        </p>
        <pre className={cx(styles.codeExample)}>
          <code>
            {`
const styles = sheet.create({
  container: {
    '.nested-text': {
      color: 'brown',
    },
  },
});
`}
          </code>
        </pre>
        <div className={cx(styles.nestingExample)}>
          <p className="nested-text">This text is nested.</p>
        </div>

        <h3>cx Utility</h3>
        <p>
          The <code>cx</code> utility helps combine Flairup class names with
          other class names or conditional classes.
        </p>
        <pre className={cx(styles.codeExample)}>
          <code>
            {`
import { cx } from 'flairup';

const styles = sheet.create({
  title: {
    fontSize: '1.5em',
    fontWeight: 'bold',
  },
  error: {
    color: 'red',
  },
});

function MyComponent({ isError }) {
  return <h2 className={cx(styles.title, { [styles.error]: isError })}>
    {isError ? "Error" : "Title"}
  </h2>;
}
`}
          </code>
        </pre>
        <h2 className={cx(styles.cxExample, styles.error)}>
          This is an error title
        </h2>

        <h3>Keyframes</h3>
        <p>Create animations with keyframes.</p>
        <pre className={cx(styles.codeExample)}>
          <code>
            {`
import { createSheet } from 'flairup';

const sheet = createSheet('my-component');

const keyframes = sheet.keyframes({
  slideIn: {
    from: {
      opacity: '0',
      transform: 'translateX(-20px)',
    },
    to: {
      opacity: '1',
      transform: 'translateX(0)',
    },
  },
});

const styles = sheet.create({
  animatedBox: {
    animation: \`\${keyframes.slideIn} 1s infinite ease-in-out\`,
    // ... other styles
  },
});
`}
          </code>
        </pre>
        <div className={cx(styles.keyframesExample)}>This will slide in!</div>
      </section>

      <footer className={cx(styles.footer)}>
        <p>
          &copy; {new Date().getFullYear()} My Company. | Source code on{' '}
          <a href="https://github.com/ealush/flairup">GitHub</a>
        </p>
      </footer>
    </div>
  );
}
