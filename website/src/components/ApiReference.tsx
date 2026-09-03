import { cx } from 'flairup';
import { stylesheet } from '../app/stylesheet';
import { Code } from './Code';

const styles = stylesheet.create({
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2em',
  },
  signature: {
    fontFamily: 'var(--font-code)',
    fontSize: '0.92rem',
    fontWeight: '500',
    marginBottom: '0.4em',
  },
  text: {
    color: 'var(--muted)',
    maxWidth: '46rem',
  },
});

const entries: Array<{ signature: string; text: string; sample?: string }> = [
  {
    signature: "createSheet(name, rootNode?)",
    text: 'Creates a named stylesheet and returns its API. Pass an element to mount into it, null to keep styles as strings only (the SSR pattern), or nothing to mount into <head>.',
    sample: `const sheet = createSheet('my-package');\n// SSR only:\nconst serverSheet = createSheet('my-package', null);`,
  },
  {
    signature: 'sheet.create(styles)',
    text: 'Defines named scopes of camelCase declarations. Each scope returns a set with one class per declaration. Nest :hover, ::before, .parent markers, &.compound selectors, @media queries, and a -- block of CSS variables.',
    sample: `const styles = sheet.create({
  card: {
    padding: '16px',
    '--accent': '#a31621',
    '&:hover': { borderColor: 'var(--accent)' },
    '@media (min-width: 700px)': { padding: '24px' },
  },
});`,
  },
  {
    signature: 'cx(...args)',
    text: 'Combines class sets, strings, arrays, and { className: boolean } maps into a single class string for className.',
    sample: `cx(styles.card, isActive && styles.active, extraClass);`,
  },
  {
    signature: 'sheet.keyframes(frames)',
    text: 'Defines named keyframe animations. Returns animation names to reference from the animation property.',
    sample: `const { fadeIn } = sheet.keyframes({
  fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
});
// animation: \`\${fadeIn} 300ms ease-out\``,
  },
  {
    signature: 'sheet.getStyle()',
    text: 'Returns the entire stylesheet as CSS text. Inject it into a <style> tag on the server; the client-side sheet continues from the same rules. See the SSR section below.',
  },
];

export function ApiReference() {
  return (
    <div className={cx(styles.list)}>
      {entries.map((entry) => (
        <div key={entry.signature}>
          <h3 className={cx(styles.signature)}>{entry.signature}</h3>
          <p className={cx(styles.text)}>{entry.text}</p>
          {entry.sample && (
            <Code language="typescript" label={`Example: ${entry.signature}`}>
              {entry.sample}
            </Code>
          )}
        </div>
      ))}
    </div>
  );
}
