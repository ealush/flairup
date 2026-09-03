import { createSheet } from '../index.js';
import { afterEach, describe, expect, it } from 'vitest';

afterEach(() => {
  document.querySelectorAll('style[id^="flairup-"]').forEach((node) => {
    node.remove();
  });
  document.body.innerHTML = '';
});

function mountedCss(name: string, root?: HTMLElement | ShadowRoot): string {
  const tag = Array.from((root ?? document).querySelectorAll('style')).find(
    (style) => style.id.startsWith('flairup-') && style.id.includes(name),
  );
  return tag?.innerHTML ?? '';
}

describe('shared sheet lifecycle acceptance', () => {
  it('merges alternating writes from every handle for the same root and name', () => {
    const first = createSheet('sharedAlternating');
    first.create({ first: { color: 'red' } });

    const second = createSheet('sharedAlternating');
    second.create({ second: { width: '10px' } });
    first.create({ third: { height: '20px' } });

    const css = mountedCss('sharedAlternating');
    expect(css).toContain('color:red');
    expect(css).toContain('width:10px');
    expect(css).toContain('height:20px');
    expect(first.getStyle()).toBe(css);
    expect(second.getStyle()).toBe(css);
  });

  it('deduplicates the same declaration across handles sharing a sheet', () => {
    const first = createSheet('sharedDedupe');
    const second = createSheet('sharedDedupe');

    first.create({ first: { color: 'red' } });
    second.create({ second: { color: 'red' } });

    expect(mountedCss('sharedDedupe').match(/color:red/g)).toHaveLength(1);
  });

  it('keeps same-name sheets isolated between roots while sharing within each root', () => {
    const left = document.createElement('div');
    const right = document.createElement('div');
    document.body.append(left, right);

    const leftFirst = createSheet('rootIdentity', left);
    const leftSecond = createSheet('rootIdentity', left);
    const rightSheet = createSheet('rootIdentity', right);

    leftFirst.create({ red: { color: 'red' } });
    leftSecond.create({ wide: { width: '10px' } });
    rightSheet.create({ blue: { color: 'blue' } });

    expect(mountedCss('rootIdentity', left)).toContain('color:red');
    expect(mountedCss('rootIdentity', left)).toContain('width:10px');
    expect(mountedCss('rootIdentity', left)).not.toContain('color:blue');
    expect(mountedCss('rootIdentity', right)).toContain('color:blue');
    expect(mountedCss('rootIdentity', right)).not.toContain('color:red');
  });

  it('keeps different sheet names isolated in the same root', () => {
    const first = createSheet('isolatedFirst');
    const second = createSheet('isolatedSecond');

    first.create({ red: { color: 'red' } });
    second.create({ blue: { color: 'blue' } });

    expect(mountedCss('isolatedFirst')).toContain('color:red');
    expect(mountedCss('isolatedFirst')).not.toContain('color:blue');
    expect(mountedCss('isolatedSecond')).toContain('color:blue');
    expect(mountedCss('isolatedSecond')).not.toContain('color:red');
  });
});

describe('SSR and hydration acceptance', () => {
  it('does not duplicate exact server CSS when the client recreates it', () => {
    const server = createSheet('hydrateExact', null);
    server.create({ box: { color: 'red', height: '10px' } });

    const serverTag = document.createElement('style');
    serverTag.id = 'flairup-hydrateExact';
    serverTag.innerHTML = server.getStyle();
    document.head.appendChild(serverTag);

    const client = createSheet('hydrateExact');
    client.create({ box: { color: 'red', height: '10px' } });

    expect(document.querySelectorAll('#flairup-hydrateExact')).toHaveLength(1);
    expect(mountedCss('hydrateExact').match(/color:red/g)).toHaveLength(1);
    expect(mountedCss('hydrateExact').match(/height:10px/g)).toHaveLength(1);
  });

  it('preserves server CSS and appends only genuinely new client CSS', () => {
    const server = createSheet('hydrateMerge', null);
    server.create({ base: { color: 'red' } });

    const serverTag = document.createElement('style');
    serverTag.id = 'flairup-hydrateMerge';
    serverTag.innerHTML = server.getStyle();
    document.head.appendChild(serverTag);

    const client = createSheet('hydrateMerge');
    client.create({ base: { color: 'red' }, extra: { width: '10px' } });

    const css = mountedCss('hydrateMerge');
    expect(css.match(/color:red/g)).toHaveLength(1);
    expect(css.match(/width:10px/g)).toHaveLength(1);
    expect(client.getStyle()).toBe(css);
  });

  it('does not duplicate server keyframes during hydration', () => {
    const frames = {
      fade: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
    };
    const server = createSheet('hydrateFrames', null);
    server.keyframes(frames);

    const serverTag = document.createElement('style');
    serverTag.id = 'flairup-hydrateFrames';
    serverTag.innerHTML = server.getStyle();
    document.head.appendChild(serverTag);

    const client = createSheet('hydrateFrames');
    client.keyframes(frames);

    expect(mountedCss('hydrateFrames').match(/@keyframes/g)).toHaveLength(1);
  });
});

describe('mount, nonce and keyframe sanity checks', () => {
  it('keeps keyframe sequence numbers contiguous across calls', () => {
    const sheet = createSheet('frameSequence', null);
    const first = sheet.keyframes({ first: { from: { opacity: '0' } } });
    const second = sheet.keyframes({ second: { to: { opacity: '1' } } });
    const third = sheet.keyframes({ third: { to: { opacity: '0' } } });
    const sequence = [first.first, second.second, third.third].map((name) => {
      const match = name.match(/_(\d+)_/);
      return match ? Number(match[1]) : Number.NaN;
    });

    expect(sequence).toEqual([0, 1, 2]);
    expect(new Set([first.first, second.second, third.third]).size).toBe(3);
  });

  it('keeps the mounted DOM exactly synchronized after every mutation', () => {
    const sheet = createSheet('domSync');
    const styleTag = document.querySelector('#flairup-domSync');

    sheet.create({ box: { color: 'red' } });
    expect(styleTag?.innerHTML).toBe(sheet.getStyle());

    sheet.keyframes({ fade: { to: { opacity: '0' } } });
    expect(styleTag?.innerHTML).toBe(sheet.getStyle());

    sheet.create({ box2: { width: '10px' } });
    expect(styleTag?.innerHTML).toBe(sheet.getStyle());
  });

  it('mounts into a shadow root, applies a nonce, and updates in place', () => {
    const host = document.createElement('div');
    document.body.appendChild(host);
    const root = host.attachShadow({ mode: 'open' });
    const sheet = createSheet('shadowNonce', {
      rootNode: root,
      nonce: 'nonce-value',
    });

    sheet.create({ box: { color: 'red' } });
    sheet.keyframes({ fade: { to: { opacity: '0' } } });

    const tag = root.querySelector('style');
    expect(tag?.getAttribute('nonce')).toBe('nonce-value');
    expect(tag?.innerHTML).toBe(sheet.getStyle());
    expect(root.querySelectorAll('style')).toHaveLength(1);
  });

  it('adopts an existing tag, adds the configured nonce, and never remounts it', () => {
    const existing = document.createElement('style');
    existing.id = 'flairup-adoptNonce';
    existing.innerHTML = '.server {color:red;}';
    document.head.appendChild(existing);

    const sheet = createSheet('adoptNonce', { nonce: 'adopted' });
    sheet.create({ client: { color: 'blue' } });

    expect(document.querySelectorAll('#flairup-adoptNonce')).toHaveLength(1);
    expect(document.querySelector('#flairup-adoptNonce')).toBe(existing);
    expect(existing.getAttribute('nonce')).toBe('adopted');
    expect(existing.innerHTML).toBe(sheet.getStyle());
  });

  it('keeps an explicitly unmounted sheet out of the DOM', () => {
    const sheet = createSheet('neverMount', null);
    sheet.create({ box: { color: 'red' } });
    sheet.keyframes({ fade: { to: { opacity: '0' } } });

    expect(sheet.isApplied()).toBe(false);
    expect(document.querySelector('[id*="neverMount"]')).toBeNull();
    expect(sheet.getStyle()).toContain('color:red');
    expect(sheet.getStyle()).toContain('@keyframes');
  });
});
