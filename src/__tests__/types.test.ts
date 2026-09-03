import { createSheet, cx } from '../index.js';
import type { CreateSheetOptions } from '../index.js';
import { afterEach, describe, expect, expectTypeOf, it } from 'vitest';

afterEach(() => {
  document.querySelectorAll('style[id^="flairup-"]').forEach((node) => {
    node.remove();
  });
  document.body.innerHTML = '';
});

describe('createSheet overloads', () => {
  it('mounts in document head with only a name', () => {
    const sheet = createSheet('typesDefault');
    sheet.create({ box: { color: 'red' } });

    expect(sheet.isApplied()).toBe(true);
    const tag = document.head.querySelector('#flairup-typesDefault');
    expect(tag).not.toBeNull();
    expect(tag?.innerHTML).toContain('color:red');
  });

  it('stays unmounted with a null root node', () => {
    const sheet = createSheet('typesNull', null);
    sheet.create({ box: { color: 'red' } });

    expect(sheet.isApplied()).toBe(false);
    expect(document.querySelector('[id*="typesNull"]')).toBeNull();
    expect(sheet.getStyle()).toContain('color:red');
  });

  it('mounts inside a legacy element root node', () => {
    const host = document.createElement('div');
    document.body.appendChild(host);
    const sheet = createSheet('typesElement', host);
    sheet.create({ box: { color: 'red' } });

    expect(sheet.isApplied()).toBe(true);
    const tag = host.querySelector('#flairup-typesElement');
    expect(tag).not.toBeNull();
    expect(tag?.innerHTML).toContain('color:red');
    expect(document.head.querySelector('#flairup-typesElement')).toBeNull();
  });

  it('applies a nonce from options', () => {
    const sheet = createSheet('typesNonce', { nonce: 'types-nonce-4' });
    sheet.create({ box: { color: 'red' } });

    expect(sheet.isApplied()).toBe(true);
    const tag = document.head.querySelector('#flairup-typesNonce');
    expect(tag?.getAttribute('nonce')).toBe('types-nonce-4');
    expect(tag?.innerHTML).toContain('color:red');
  });

  it('mounts inside rootNode from options', () => {
    const host = document.createElement('div');
    document.body.appendChild(host);
    const sheet = createSheet('typesRoot', { rootNode: host });
    sheet.create({ box: { color: 'red' } });

    expect(sheet.isApplied()).toBe(true);
    const tag = host.querySelector('#flairup-typesRoot');
    expect(tag).not.toBeNull();
    expect(tag?.innerHTML).toContain('color:red');
    expect(document.head.querySelector('#flairup-typesRoot')).toBeNull();
  });

  it('mounts inside rootNode with a nonce from options', () => {
    const host = document.createElement('div');
    document.body.appendChild(host);
    const sheet = createSheet('typesBoth', {
      nonce: 'types-both-nonce',
      rootNode: host,
    });
    sheet.create({ box: { color: 'red' } });

    expect(sheet.isApplied()).toBe(true);
    const tag = host.querySelector('#flairup-typesBoth');
    expect(tag).not.toBeNull();
    expect(tag?.getAttribute('nonce')).toBe('types-both-nonce');
    expect(tag?.innerHTML).toContain('color:red');
  });
});

describe('public type contracts', () => {
  it('types create output as a record of class sets', () => {
    const sheet = createSheet('typesCreate');
    const styles = sheet.create({ box: { color: 'red' } });

    expectTypeOf(styles).toMatchTypeOf<Record<string, Set<string>>>();
    expect(styles.box).toBeInstanceOf(Set);
  });

  it('types cx output as a string', () => {
    expectTypeOf(cx('a', ['b'])).toEqualTypeOf<string>();
    expect(cx('a', ['b'])).toBe('a b');
  });

  it('types keyframes output as a record of names', () => {
    const sheet = createSheet('typesFrames', null);
    const frames = sheet.keyframes({
      fade: { from: { opacity: '0' }, to: { opacity: '1' } },
    });

    expectTypeOf(frames).toMatchTypeOf<Record<string, string>>();
    expect(typeof frames.fade).toBe('string');
  });

  it('types CreateSheetOptions with rootNode and nonce', () => {
    const host = document.createElement('div');
    expectTypeOf({ nonce: 'types-nonce', rootNode: host }).toMatchTypeOf<CreateSheetOptions>();

    const options: CreateSheetOptions = {
      nonce: 'types-nonce',
      rootNode: host,
    };
    expect(options.nonce).toBe('types-nonce');
    expect(options.rootNode).toBe(host);
  });
});
