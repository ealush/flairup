import { createSheet } from '../index.js';
import { afterEach, describe, expect, it } from 'vitest';

afterEach(() => {
  document.querySelectorAll('style').forEach((styleTag) => {
    styleTag.remove();
  });
});

describe('style lifecycle', () => {
  it('writes keyframes to the mounted style element', () => {
    const sheet = createSheet('lcKeyframes');
    sheet.keyframes({
      fade: {
        '0%': { opacity: '0' },
        '100%': { opacity: '1' },
      },
    });

    const styleTag = document.querySelector('style#flairup-lcKeyframes');
    expect(styleTag?.innerHTML).toContain('@keyframes');
    expect(styleTag?.innerHTML).toContain('opacity:1');
  });

  it('numbers keyframes independently of created styles', () => {
    const sheet = createSheet('lcStableNames', null);
    sheet.create({
      first: { color: 'red' },
    });
    const first = sheet.keyframes({
      fade: {
        '0%': { opacity: '0' },
        '100%': { opacity: '1' },
      },
    });
    sheet.create({
      second: { color: 'blue' },
    });
    const second = sheet.keyframes({
      slide: {
        '0%': { opacity: '0' },
        '100%': { opacity: '1' },
      },
    });

    expect(first.fade).toBe('lcStableNames_0_fade');
    expect(second.slide).toBe('lcStableNames_1_slide');
  });

  it('keeps keyframes and component styles in the same element', () => {
    const sheet = createSheet('lcCombined');
    sheet.create({
      box: { color: 'red' },
    });
    sheet.keyframes({
      fade: {
        '0%': { opacity: '0' },
        '100%': { opacity: '1' },
      },
    });

    expect(sheet.getStyle()).toContain('color:red');
    expect(sheet.getStyle()).toContain('@keyframes');

    const styleTag = document.querySelector('style#flairup-lcCombined');
    expect(styleTag?.innerHTML).toBe(sheet.getStyle());
  });

  it('reuses one style element for repeated sheets with the same name', () => {
    createSheet('lcReuse');
    createSheet('lcReuse');

    expect(
      document.querySelectorAll('style#flairup-lcReuse').length,
    ).toBe(1);
  });

  it('adopts server-rendered styles instead of duplicating the tag', () => {
    const serverTag = document.createElement('style');
    serverTag.id = 'flairup-lcHydrate';
    serverTag.innerHTML = '.ssr {color:red;}';
    document.head.appendChild(serverTag);

    const sheet = createSheet('lcHydrate');

    expect(
      document.querySelectorAll('style#flairup-lcHydrate').length,
    ).toBe(1);
    expect(sheet.getStyle()).toContain('.ssr {color:red;}');

    sheet.create({
      box: { color: 'blue' },
    });

    const styleTag = document.querySelector('style#flairup-lcHydrate');
    expect(styleTag?.innerHTML).toContain('.ssr {color:red;}');
    expect(styleTag?.innerHTML).toContain('color:blue');
  });

  it('isolates style elements per root node', () => {
    const first = document.createElement('div');
    const second = document.createElement('div');
    document.body.append(first, second);

    createSheet('lcRoots', first);
    createSheet('lcRoots', second);

    expect(first.querySelector('style#flairup-lcRoots')).not.toBeNull();
    expect(second.querySelector('style#flairup-lcRoots')).not.toBeNull();
    expect(document.head.querySelector('style#flairup-lcRoots')).toBeNull();
  });

  it('supports shadow roots as mount targets', () => {
    const host = document.createElement('div');
    document.body.appendChild(host);
    const shadow = host.attachShadow({ mode: 'open' });

    const sheet = createSheet('lcShadow', { rootNode: shadow });

    expect(sheet.isApplied()).toBe(true);
    expect(shadow.querySelector('style#flairup-lcShadow')).not.toBeNull();
  });

  it('sets the nonce on the style element when provided', () => {
    createSheet('lcNonce', { nonce: 'test-nonce' });

    const styleTag = document.querySelector('style#flairup-lcNonce');
    expect(styleTag?.getAttribute('nonce')).toBe('test-nonce');
  });

  it('keeps supporting an element as the second argument', () => {
    const root = document.createElement('div');
    document.body.appendChild(root);

    const sheet = createSheet('lcLegacyRoot', root);

    expect(sheet.isApplied()).toBe(true);
    expect(root.querySelector('style#flairup-lcLegacyRoot')).not.toBeNull();
  });
});
