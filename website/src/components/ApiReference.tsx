import { cx } from 'flairup';
import { stylesheet } from '../app/stylesheet';
import { Code } from './Code';

const styles = stylesheet.create({
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2em',
  },
  entry: {
    backgroundColor: 'var(--card)',
    border: '1px solid var(--line)',
    borderRadius: 'var(--radius)',
    padding: '1.25rem 1.25rem 1.4rem',
  },
  signature: {
    display: 'inline-block',
    fontFamily: 'var(--font-code)',
    fontSize: '0.88rem',
    fontWeight: '500',
    color: 'var(--code-fg)',
    backgroundColor: 'var(--code-bg)',
    borderRadius: '6px',
    padding: '0.3em 0.7em',
    marginBottom: '0.8em',
  },
  text: {
    color: 'var(--muted)',
    maxWidth: '46rem',
  },
});

const entries: Array<{ signature: string; text: string; sample?: string }> = [
  {
    signature: "createSheet(name, rootNode?)",
    text: 'Creates a named stylesheet and returns { create, keyframes, getStyle, isApplied }. Pass an element to mount into it, null to keep styles as strings only (the SSR pattern), or nothing to mount into <head>. An options object { rootNode, nonce } covers the rest.',
    sample: `const sheet = createSheet('my-package');\n// SSR only:\nconst serverSheet = createSheet('my-package', null);`,
  },
  {
    signature: 'sheet.create(styles)',
    text: 'Defines named scopes of camelCase declarations. Each scope returns a set with one class per declaration. Nest :hover, ::before, .parent markers, &.compound selectors, @media queries, and a -- block of CSS variables.',
    sample: `const styles = sheet.create({
  card: {
    padding: '16px',
    '--accent': '#9c1a24',
    '&:hover': { borderColor: 'var(--accent)' },
    '@media (min-width: 700px)': { padding: '24px' },
  },
});`,
  },
  {
    signature: 'cx(...args)',
    text: 'Combines class sets, strings, arrays, and { className: boolean } maps into a single class string for className. When two classes set the same declaration the later one wins and removes the earlier one from the output; non-conflicting and unknown classes are preserved. Atomic shorthands resolve as one unit, so give each visual state its own complete scope (see Variants) when overriding them.',
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
  {
    signature: 'sheet.isApplied()',
    text: 'Reports whether the sheet has mounted a <style> tag. Tells a live browser sheet apart from a detached, strings-only server sheet.',
    sample: `if (!sheet.isApplied()) {\n  // strings-only mode: ship sheet.getStyle() to the client\n}`,
  },
];

export function ApiReference() {
  return (
    <div className={cx(styles.list)}>
      {entries.map((entry) => (
        <div key={entry.signature} className={cx(styles.entry)}>
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
