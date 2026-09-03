import React from 'react';
import { cx } from 'flairup';
import { stylesheet } from '../app/stylesheet';

const styles = stylesheet.create({
  nav: {
    position: 'sticky',
    top: '0',
    zIndex: '50',
    backgroundColor: 'var(--paper)',
    borderBottom: '1px solid var(--line)',
  },
  inner: {
    maxWidth: 'var(--measure)',
    margin: '0 auto',
    padding: '0.8rem 1.25rem',
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem',
    flexWrap: 'wrap',
  },
  brand: {
    fontFamily: 'var(--font-display)',
    fontWeight: '700',
    fontSize: '1.25rem',
    color: 'var(--ink)',
    textDecoration: 'none',
    marginRight: 'auto',
  },
  links: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.1rem',
    flexWrap: 'wrap',
    listStyleType: 'none',
  },
  link: {
    color: 'var(--muted)',
    textDecoration: 'none',
    fontSize: '0.95rem',
    '&:hover': {
      color: 'var(--accent)',
      textDecoration: 'underline',
    },
  },
  iconLink: {
    color: 'var(--muted)',
    display: 'inline-flex',
    alignItems: 'center',
    '&:hover': {
      color: 'var(--accent)',
    },
  },
});

const sectionLinks = [
  { href: '#problem', label: 'Problem' },
  { href: '#concepts', label: 'Concepts' },
  { href: '#api', label: 'API' },
  { href: '#examples', label: 'Examples' },
  { href: '#ssr', label: 'SSR' },
];

function IconLink({
  href,
  label,
  path,
}: {
  href: string;
  label: string;
  path: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className={cx(styles.iconLink)}
    >
      <svg height="18" width="18" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
        <path d={path} />
      </svg>
    </a>
  );
}

export function SiteNav() {
  return (
    <nav aria-label="Site" className={cx(styles.nav)}>
      <div className={cx(styles.inner)}>
        <a href="#top" className={cx(styles.brand)}>
          FlairUp
        </a>
        <ul className={cx(styles.links)}>
          {sectionLinks.map((link) => (
            <li key={link.href}>
              <a href={link.href} className={cx(styles.link)}>
                {link.label}
              </a>
            </li>
          ))}
          <li>
            <IconLink
              href="https://github.com/ealush/flairup"
              label="FlairUp on GitHub"
              path="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"
            />
          </li>
          <li>
            <IconLink
              href="https://www.npmjs.com/package/flairup"
              label="FlairUp on npm"
              path="M0 7.334v8h6.666v1.332H12v-1.332h12v-8H0zm6.666 6.668H5.334v-4H3.999v4H1.335V8.667h5.331v5.335zm4 0v1.336H8.001V8.667h5.334v5.332h-2.669v-.001zm12.001 0h-1.33v-4h-1.336v4h-1.335v-4h-1.33v4h-2.671V8.667h8.002v5.335zM10.665 10H12v2.667h-1.335V10z"
            />
          </li>
        </ul>
      </div>
    </nav>
  );
}
