import React from 'react';
import { cx } from 'flairup';
import { stylesheet } from '../app/stylesheet';
import { Example } from '../components/Example';

const exampleStyle = {
  box: {
    backgroundColor: 'lightblue',
    padding: '20px',
    color: '#000',
    '@media (max-width: 600px)': {
      backgroundColor: 'lightcoral',
      padding: '10px',
    },
  },
};

const styles = stylesheet.create({
  ...exampleStyle,
});

export function MediaQueries() {
  return (
    <Example
      title="Media Queries"
      description="Demonstrates how to use media queries in FlairUp. This example shows a responsive box that changes its background color and padding based on the viewport width. The media query is defined directly in the style object using the `@media` syntax."
      exampleStyle={exampleStyle}
      usage={`function ResponsiveBox() {
  return (
    <div className={cx(styles.box)}>
      Resize the window to see the effect
    </div>
  );
}`}
    >
      <div className={cx(styles.box)}>Resize the window to see the effect</div>
    </Example>
  );
}
