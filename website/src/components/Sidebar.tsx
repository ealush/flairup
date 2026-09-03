import React from 'react';
import { cx } from 'flairup';
import { stylesheet } from '../app/stylesheet';

const styles = stylesheet.create({
  aside: {
    display: 'none',
    '@media (min-width: 1024px)': {
      display: 'block',
    },
  },
  nav: {
    position: 'sticky',
    top: '5rem',
    maxHeight: 'calc(100vh - 6rem)',
    overflowY: 'auto',
    paddingBottom: '2rem',
    scrollbarWidth: 'thin',
  },
  heading: {
    fontSize: '0.8rem',
    fontWeight: '650',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: 'var(--muted)',
    marginBottom: '0.75em',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.15em',
    listStyleType: 'none',
    borderLeft: '1px solid var(--line)',
  },
  link: {
    display: 'block',
    color: 'var(--muted)',
    textDecoration: 'none',
    fontSize: '0.95rem',
    padding: '0.3em 0 0.3em 1em',
    borderLeft: '2px solid transparent',
    marginLeft: '-1px',
    '&:hover': {
      color: 'var(--accent)',
    },
  },
});

const links = [
  { href: '#problem', label: 'Why packages need styling' },
  { href: '#concepts', label: 'Core concepts' },
  { href: '#features', label: 'Features' },
  { href: '#installation', label: 'Installation' },
  { href: '#api', label: 'API reference' },
  { href: '#examples', label: 'Examples' },
  { href: '#ssr', label: 'Server-side rendering' },
];

export function Sidebar() {
  return (
    <aside className={cx(styles.aside)}>
      <nav aria-label="On this page" className={cx(styles.nav)}>
        <p className={cx(styles.heading)}>On this page</p>
        <ul className={cx(styles.list)}>
          {links.map((link) => (
            <li key={link.href}>
              <a href={link.href} className={cx(styles.link)}>
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
