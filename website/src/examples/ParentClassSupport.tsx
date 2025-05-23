import React from 'react';
import { cx } from 'flairup';
import { stylesheet } from '../app/stylesheet';
import { Example } from '../components/Example';

const exampleStyle = {
  '.theme-dark': {
    button: {
      backgroundColor: '#3498db',
      color: 'white',
      '&:hover': {
        backgroundColor: '#2980b9',
      },
    },
  },
  '.theme-light': {
    button: {
      backgroundColor: '#2ecc71',
      color: 'white',
      '&:hover': {
        backgroundColor: '#27ae60',
      },
    },
  },
};

const styles = stylesheet.create({
  themeContainer: {
    display: 'flex',
    gap: '1em',
    marginBottom: '1em',
  },
  themeBox: {
    padding: '1em',
    borderRadius: '8px',
    flex: '1',
  },
  themeDark: {
    backgroundColor: '#2c3e50',
    color: '#ecf0f1',
  },
  themeLight: {
    backgroundColor: '#ecf0f1',
    color: 'var(--title-color)',
  },
  button: {
    padding: '10px 20px',
    borderRadius: '5px',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  ...exampleStyle,
});

export function ParentClassSupport() {
  return (
    <Example
      title="Parent Class Support"
      description={
        <div>
          FlairUp allows you to scope styles based on a top-level class name
          provided when defining your styles. This feature serves two key
          purposes:
          <ul>
            <li>
              {`Theme Responsiveness within your Component: By defining styles
              under a specific parent class, your component's styles can react
              to external theming or global styles applied at a higher level in
              the application. For example, you can have different styles for
              your component when it resides within a \`.theme-dark\` container.`}
            </li>
            <li>
              {`User Customization: This feature enables users consuming your
              component to easily customize its appearance by applying their own
              top-level classes. Your component can then define specific styles
              that are activated when these user-defined classes are present in
              the component's parent hierarchy. This example demonstrates
              theme-based styling where button styles change based on the parent
              theme class (dark or light). The styles are scoped using the
              \`.theme-dark\` and \`.theme-light\` selectors, allowing for
              contextual styling`}
            </li>
          </ul>
        </div>
      }
      exampleStyle={exampleStyle}
      usage={`function ThemeButtons() {
  return (
    <div className={cx(styles.themeContainer)}>
      <div className={cx(styles.themeBox, styles.themeDark, 'theme-dark')}>
        <button className={cx(styles.button)}>Dark Theme Button</button>
      </div>
      <div className={cx(styles.themeBox, styles.themeLight, 'theme-light')}>
        <button className={cx(styles.button)}>Light Theme Button</button>
      </div>
    </div>
  );
}`}
    >
      <div className={cx(styles.themeContainer)}>
        <div className={cx(styles.themeBox, styles.themeDark, 'theme-dark')}>
          <button className={cx(styles.button)}>Dark Theme Button</button>
        </div>
        <div className={cx(styles.themeBox, styles.themeLight, 'theme-light')}>
          <button className={cx(styles.button)}>Light Theme Button</button>
        </div>
      </div>
    </Example>
  );
}
