import { cx } from 'flairup';
import { stylesheet } from '../app/stylesheet';

export type HeroDemoVariant = 'primary' | 'secondary' | 'quiet';

export interface HeroDemoClasses {
  demo: string;
  demoLabel: string;
  stage: string;
  switcher: string;
  caption: string;
  demoButton: Record<HeroDemoVariant, string>;
  pill: Record<HeroDemoVariant, Record<HeroDemoVariant, string>>;
}

// Demo styles live here, in the server module graph, so their rules are
// part of the inlined stylesheet. Each visual state is a complete scope:
// under flairup 1.1.0, cx() keeps every class it is given and the
// stylesheet's rule order decides same-property conflicts, so layered
// base + override scopes would depend on global creation order. The
// client <HeroDemo> receives one finished class string per state —
// plain records of strings, which cross the server/client boundary;
// functions would not.
const styles = stylesheet.create({
  demo: {
    backgroundColor: 'var(--on-dark-panel)',
    border: '1px solid var(--line)',
    borderRadius: 'var(--radius)',
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  demoLabel: {
    fontSize: '0.8rem',
    fontWeight: '600',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: 'var(--on-dark-muted)',
  },
  stage: {
    display: 'flex',
    justifyContent: 'center',
    padding: '1.5rem 0',
  },
  demoPrimary: {
    font: 'inherit',
    fontWeight: '600',
    padding: '10px 24px',
    borderRadius: '8px',
    border: '1px solid transparent',
    cursor: 'pointer',
    color: 'var(--on-dark-btn-fg)',
    backgroundColor: 'var(--on-dark-btn-bg)',
    transition: 'background-color 0.15s ease',
    '&:hover': {
      backgroundColor: 'var(--on-dark-fg)',
    },
  },
  demoSecondary: {
    font: 'inherit',
    fontWeight: '600',
    padding: '10px 24px',
    borderRadius: '8px',
    border: '1px solid var(--on-dark-muted)',
    cursor: 'pointer',
    color: 'var(--on-dark-fg)',
    backgroundColor: 'transparent',
    transition: 'background-color 0.15s ease',
    '&:hover': {
      backgroundColor: 'transparent',
      borderColor: 'var(--on-dark-fg)',
    },
  },
  demoQuiet: {
    font: 'inherit',
    fontWeight: '600',
    padding: '10px 24px',
    borderRadius: '8px',
    border: '1px solid transparent',
    cursor: 'pointer',
    color: 'var(--on-dark-accent)',
    backgroundColor: 'transparent',
    transition: 'background-color 0.15s ease',
    '&:hover': {
      backgroundColor: 'transparent',
      color: 'var(--on-dark-fg)',
    },
  },
  switcher: {
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'wrap',
  },
  pillIdle: {
    font: 'inherit',
    fontSize: '0.9rem',
    fontWeight: '600',
    color: 'var(--on-dark-fg)',
    backgroundColor: 'transparent',
    border: '1px solid var(--on-dark-muted)',
    borderRadius: '999px',
    padding: '0.4em 1em',
    cursor: 'pointer',
    '&:hover': {
      borderColor: 'var(--on-dark-fg)',
    },
  },
  pillPressed: {
    font: 'inherit',
    fontSize: '0.9rem',
    fontWeight: '600',
    color: 'var(--on-dark-btn-fg)',
    backgroundColor: 'var(--on-dark-fg)',
    border: '1px solid var(--on-dark-fg)',
    borderRadius: '999px',
    padding: '0.4em 1em',
    cursor: 'pointer',
    '&:hover': {
      borderColor: 'var(--on-dark-fg)',
    },
  },
  caption: {
    fontFamily: 'var(--font-code)',
    fontSize: '0.82rem',
    color: 'var(--on-dark-muted)',
    borderTop: '1px solid var(--line)',
    paddingTop: '1rem',
  },
});

const demoButton: Record<HeroDemoVariant, string> = {
  primary: cx(styles.demoPrimary),
  secondary: cx(styles.demoSecondary),
  quiet: cx(styles.demoQuiet),
};

function pillsFor(selected: HeroDemoVariant): Record<HeroDemoVariant, string> {
  return {
    primary: cx(selected === 'primary' ? styles.pillPressed : styles.pillIdle),
    secondary: cx(selected === 'secondary' ? styles.pillPressed : styles.pillIdle),
    quiet: cx(selected === 'quiet' ? styles.pillPressed : styles.pillIdle),
  };
}

export const heroDemoClasses: HeroDemoClasses = {
  demo: cx(styles.demo),
  demoLabel: cx(styles.demoLabel),
  stage: cx(styles.stage),
  switcher: cx(styles.switcher),
  caption: cx(styles.caption),
  demoButton,
  pill: {
    primary: pillsFor('primary'),
    secondary: pillsFor('secondary'),
    quiet: pillsFor('quiet'),
  },
};
