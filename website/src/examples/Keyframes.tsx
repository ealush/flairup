import React from 'react';
import { cx } from 'flairup';
import { stylesheet } from '../app/stylesheet';
import { Example } from '../components/Example';
import { AnimationDemo, type LoadingDemo } from '../components/AnimationDemo';

const keyframes = stylesheet.keyframes({
  spin: {
    from: { transform: 'rotate(0deg)' },
    to: { transform: 'rotate(360deg)' },
  },
  shimmer: {
    from: { opacity: '0.45' },
    to: { opacity: '1' },
  },
  bounce: {
    '0%': { transform: 'translateY(0)' },
    '50%': { transform: 'translateY(-4px)' },
    '100%': { transform: 'translateY(0)' },
  },
});

const styles = stylesheet.create({
  switcher: {
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'wrap',
    marginBottom: '1.5em',
  },
  optionIdle: {
    font: 'inherit',
    fontSize: '0.9rem',
    fontWeight: '600',
    color: 'var(--ink)',
    backgroundColor: 'transparent',
    border: '1px solid var(--field-border)',
    borderRadius: '999px',
    padding: '0.4em 1em',
    cursor: 'pointer',
    '&:hover': {
      borderColor: 'var(--ink)',
    },
  },
  optionPressed: {
    font: 'inherit',
    fontSize: '0.9rem',
    fontWeight: '600',
    color: 'var(--paper)',
    backgroundColor: 'var(--ink)',
    border: '1px solid var(--ink)',
    borderRadius: '999px',
    padding: '0.4em 1em',
    cursor: 'pointer',
  },
  stage: {
    display: 'flex',
    alignItems: 'center',
    minHeight: '72px',
  },
  spinner: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    border: '3px solid var(--line)',
    borderTopColor: 'var(--accent)',
    animation: `${keyframes.spin} 0.9s linear infinite`,
  },
  skeleton: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  skeletonLine: {
    height: '12px',
    borderRadius: '6px',
    backgroundColor: 'var(--line)',
    animation: `${keyframes.shimmer} 1.2s ease-in-out infinite alternate`,
  },
  skeletonLong: {
    width: '200px',
  },
  skeletonShort: {
    width: '120px',
  },
  typing: {
    display: 'flex',
    gap: '6px',
    alignItems: 'center',
  },
  dot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    backgroundColor: 'var(--accent)',
    animation: `${keyframes.bounce} 1.2s ease-in-out infinite`,
  },
  dotDelayed: {
    animationDelay: '0.15s',
  },
  dotLate: {
    animationDelay: '0.3s',
  },
});

const classes = {
  switcher: cx(styles.switcher),
  optionIdle: cx(styles.optionIdle),
  optionPressed: cx(styles.optionPressed),
};

const demos: Record<LoadingDemo, React.ReactNode> = {
  spinner: (
    <div className={cx(styles.stage)}>
      <div role="status" aria-label="Loading" className={cx(styles.spinner)} />
    </div>
  ),
  skeleton: (
    <div className={cx(styles.stage)}>
      <div className={cx(styles.skeleton)} aria-hidden="true">
        <div className={cx(styles.skeletonLine, styles.skeletonLong)} />
        <div className={cx(styles.skeletonLine, styles.skeletonShort)} />
      </div>
    </div>
  ),
  typing: (
    <div className={cx(styles.stage)}>
      <div
        className={cx(styles.typing)}
        role="status"
        aria-label="Someone is typing"
      >
        <span className={cx(styles.dot)} />
        <span className={cx(styles.dot, styles.dotDelayed)} />
        <span className={cx(styles.dot, styles.dotLate)} />
      </div>
    </div>
  ),
};

// The demos above combine disjoint scopes (shape + motion), so cx() only
// ever joins classes that set different properties. The switcher chrome
// uses one complete scope per state for the same reason.
const styleCode = `const keyframes = sheet.keyframes({
  spin: {
    from: { transform: 'rotate(0deg)' },
    to: { transform: 'rotate(360deg)' },
  },
  shimmer: {
    from: { opacity: '0.45' },
    to: { opacity: '1' },
  },
  bounce: {
    '0%': { transform: 'translateY(0)' },
    '50%': { transform: 'translateY(-4px)' },
    '100%': { transform: 'translateY(0)' },
  },
});

const styles = sheet.create({
  spinner: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    border: '3px solid var(--line)',
    borderTopColor: 'var(--accent)',
    animation: \`\${keyframes.spin} 0.9s linear infinite\`,
  },
  skeletonLine: {
    height: '12px',
    borderRadius: '6px',
    backgroundColor: 'var(--line)',
    animation: \`\${keyframes.shimmer} 1.2s ease-in-out infinite alternate\`,
  },
  dot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    backgroundColor: 'var(--accent)',
    animation: \`\${keyframes.bounce} 1.2s ease-in-out infinite\`,
  },
  dotDelayed: {
    animationDelay: '0.15s',
  },
});`;

const usageCode = `function Loading({ kind }: { kind: 'spinner' | 'skeleton' | 'typing' }) {
  if (kind === 'spinner') {
    return <div role="status" aria-label="Loading" className={cx(styles.spinner)} />;
  }
  if (kind === 'typing') {
    return (
      <div className={cx(styles.typing)} role="status" aria-label="Someone is typing">
        <span className={cx(styles.dot)} />
        <span className={cx(styles.dot, styles.dotDelayed)} />
        <span className={cx(styles.dot, styles.dotLate)} />
      </div>
    );
  }
  return (
    <div className={cx(styles.skeleton)} aria-hidden="true">
      <div className={cx(styles.skeletonLine, styles.skeletonLong)} />
      <div className={cx(styles.skeletonLine, styles.skeletonShort)} />
    </div>
  );
}`;

export function Keyframes() {
  return (
    <Example
      title="Keyframe animations"
      description="Define keyframes once, reference the returned names from animation. Pick an animation above — the typing dots add staggered delays to the same pattern. This site disables animation under prefers-reduced-motion, so all three go still for users who ask."
      exampleStyle={styleCode}
      usage={usageCode}
    >
      <AnimationDemo classes={classes} demos={demos} />
    </Example>
  );
}
