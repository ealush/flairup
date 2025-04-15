import React from 'react';
import { cx } from 'flairup';
import { stylesheet } from '../app/stylesheet';
import { Example } from '../components/Example';

const keyframes = stylesheet.keyframes({
  bounce: {
    '0%': { transform: 'translateY(0)' },
    '50%': { transform: 'translateY(-20px)' },
    '100%': { transform: 'translateY(0)' },
  },
  pulse: {
    '0%': { transform: 'scale(1)' },
    '50%': { transform: 'scale(1.2)' },
    '100%': { transform: 'scale(1)' },
  },
});

const exampleStyle = {
  box: {
    width: '50px',
    height: '50px',
    backgroundColor: '#3498db',
    margin: '10px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: '30px',
    lineHeight: '1',
    borderRadius: '10px',
  },
  bouncingBox: {
    animation: `${keyframes.bounce} 1s infinite`,
  },
  pulsingBox: {
    animation: `${keyframes.pulse} 1s infinite`,
  },
};

const styles = stylesheet.create({
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '200px',
  },
  ...exampleStyle,
});

export function Keyframes() {
  return (
    <Example 
      title="Keyframes Animations" 
      description="Demonstrates how to create and use keyframe animations in FlairUp. This example shows two animated boxes: one using a bounce animation and another using a pulse animation. The keyframes are defined using the `keyframes` function and applied to elements using the `animation` property."
      exampleStyle={`// First, define your keyframes
const keyframes = stylesheet.keyframes({
  bounce: {
    '0%': { transform: 'translateY(0)' },
    '50%': { transform: 'translateY(-20px)' },
    '100%': { transform: 'translateY(0)' },
  },
  pulse: {
    '0%': { transform: 'scale(1)' },
    '50%': { transform: 'scale(1.2)' },
    '100%': { transform: 'scale(1)' },
  },
});

// Then use them in your styles with template strings
const styles = stylesheet.create({
  box: {
    width: '50px',
    height: '50px',
    backgroundColor: '#3498db',
    margin: '10px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: '30px',
    lineHeight: '1',
    borderRadius: '10px',
  },
  bouncingBox: {
    animation: \`\${keyframes.bounce} 1s infinite\`,
  },
  pulsingBox: {
    animation: \`\${keyframes.pulse} 1s infinite\`,
  },
});`}
      usage={`
// Finally, apply the styles
function AnimatedBoxes() {
  return (
    <div className={cx(styles.container)}>
      <div className={cx(styles.box, styles.bouncingBox)}>🎩</div>
      <div className={cx(styles.box, styles.pulsingBox)}>🎩</div>
    </div>
  );
}`}
    >
      <div className={cx(styles.container)}>
        <div className={cx(styles.box, styles.bouncingBox)}>🎩</div>
        <div className={cx(styles.box, styles.pulsingBox)}>🎩</div>
      </div>
    </Example>
  );
} 