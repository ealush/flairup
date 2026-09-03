import { createSheet } from '../index.js';
import { afterEach, describe, expect, it } from 'vitest';

afterEach(() => {
  document.querySelectorAll('style[id^="flairup-"]').forEach((node) => {
    node.remove();
  });
  document.body.innerHTML = '';
});

describe('sheet cache scope', () => {
  it('shares one sheet between an omitted root and explicit document.head', () => {
    const implicit = createSheet('cacheScopeDefault');
    implicit.create({ box: { color: 'red' } });

    const explicit = createSheet('cacheScopeDefault', document.head);
    explicit.create({ panel: { color: 'blue' } });

    expect(explicit.getStyle()).toContain('color:red;');
    expect(implicit.getStyle()).toContain('color:blue;');
  });

  it('shares one sheet when explicit document.head comes first', () => {
    const explicit = createSheet('cacheScopeReversed', document.head);
    explicit.create({ box: { color: 'red' } });

    const implicit = createSheet('cacheScopeReversed');
    implicit.create({ panel: { color: 'blue' } });

    expect(implicit.getStyle()).toContain('color:red;');
    expect(explicit.getStyle()).toContain('color:blue;');
  });

  it('shares one sheet with the options form pointing at document.head', () => {
    const implicit = createSheet('cacheScopeOptions');
    implicit.create({ box: { color: 'red' } });

    const viaOptions = createSheet('cacheScopeOptions', {
      rootNode: document.head,
    });
    viaOptions.create({ panel: { color: 'blue' } });

    expect(implicit.getStyle()).toContain('color:blue;');
    expect(viaOptions.getStyle()).toContain('color:red;');
  });

  it('keeps a genuinely different root separate from the default scope', () => {
    const host = document.createElement('div');
    document.body.appendChild(host);

    const implicit = createSheet('cacheScopeSplit');
    implicit.create({ box: { color: 'red' } });

    const hosted = createSheet('cacheScopeSplit', host);
    hosted.create({ panel: { color: 'blue' } });

    expect(hosted.getStyle()).not.toContain('color:red;');
    expect(implicit.getStyle()).not.toContain('color:blue;');
    expect(host.querySelector('#flairup-cacheScopeSplit')).not.toBeNull();
    expect(
      document.head.querySelector('#flairup-cacheScopeSplit'),
    ).not.toBeNull();
  });

  it('syncs a nonce onto the shared default-scope sheet', () => {
    const implicit = createSheet('cacheScopeNonce');
    implicit.create({ box: { color: 'red' } });

    createSheet('cacheScopeNonce', { nonce: 'cache-scope-nonce' });

    const tag = document.head.querySelector('#flairup-cacheScopeNonce');
    expect(tag?.getAttribute('nonce')).toBe('cache-scope-nonce');
  });
});
