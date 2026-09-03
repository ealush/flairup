import { createSheet, cx } from '../index.js';
import { afterEach, describe, expect, it } from 'vitest';

afterEach(() => {
  document.querySelectorAll('style[id^="flairup-"]').forEach((node) => {
    node.remove();
  });
  document.body.innerHTML = '';
});

describe('edge cases', () => {
  it('accepts an empty create call without output', () => {
    const sheet = createSheet('edgeEmpty');
    expect(() => sheet.create({})).not.toThrow();
    expect(sheet.create({})).toEqual({});
    expect(sheet.getStyle()).toBe('');
  });

  it('accepts an empty scope without output', () => {
    const sheet = createSheet('edgeEmptyScope');
    expect(() => sheet.create({ a: {} })).not.toThrow();
    const styles = sheet.create({ a: {} });
    expect(styles.a ?? new Set<string>()).toEqual(new Set<string>());
    expect(sheet.getStyle()).toBe('');
  });

  it('keeps numeric property values', () => {
    const sheet = createSheet('edgeNumeric', null);
    const styles = sheet.create({
      box: {
        opacity: 0 as unknown as string,
        width: 100 as unknown as string,
      },
    });

    expect(styles.box.size).toBe(2);
    expect(sheet.getStyle()).toContain('width:100;');
    expect(sheet.getStyle()).toContain('opacity:0;');
  });

  it('passes !important through to the declaration', () => {
    const sheet = createSheet('edgeImportant', null);
    const styles = sheet.create({
      box: { color: 'red !important', width: '10px !important' },
    });

    expect(styles.box.size).toBe(2);
    expect(sheet.getStyle()).toContain('color:red !important;');
    expect(sheet.getStyle()).toContain('width:10px !important;');
  });

  it('quotes the content property', () => {
    const sheet = createSheet('edgeContent', null);
    const styles = sheet.create({ box: { content: 'hello' } });

    expect(styles.box.size).toBe(1);
    expect(sheet.getStyle()).toContain('content:"hello";');
  });

  it('keeps var() with a fallback value intact', () => {
    const sheet = createSheet('edgeVarFallback', null);
    const styles = sheet.create({
      box: { color: 'var(--edge-brand, blue)' },
    });

    expect(styles.box.size).toBe(1);
    expect(sheet.getStyle()).toContain('color:var(--edge-brand, blue);');
  });

  it('keeps unicode property values intact', () => {
    const sheet = createSheet('edgeUnicode', null);
    const styles = sheet.create({
      box: { content: '→', fontFamily: 'ユニコード' },
    });

    expect(styles.box.size).toBe(2);
    expect(sheet.getStyle()).toContain('content:"→";');
    expect(sheet.getStyle()).toContain('font-family:ユニコード;');
  });

  it('passes a direct string class through and mixes it into cx', () => {
    const sheet = createSheet('edgeDirectString', null);
    const styles = sheet.create({ box: { '.': 'edge-passthrough' } });
    const other = sheet.create({ other: { color: 'red' } });

    expect(styles.box).toContain('edge-passthrough');
    const output = cx(styles.box, other.other);
    expect(output).toContain('edge-passthrough');
    expect(output).toContain(Array.from(other.other).join(' '));
  });

  it('passes a direct class array through in order', () => {
    const sheet = createSheet('edgeDirectArray', null);
    const styles = sheet.create({ box: { '.': ['edge-one', 'edge-two'] } });

    expect(styles.box).toContain('edge-one');
    expect(styles.box).toContain('edge-two');
    expect(cx(styles.box)).toBe('edge-one edge-two');
  });

  it('emits pseudo-elements with appended selectors', () => {
    const sheet = createSheet('edgePseudoElements', null);
    const styles = sheet.create({
      box: {
        '::before': { content: 'x' },
        '::placeholder': { color: 'red' },
      },
    });

    expect(styles.box.size).toBe(2);
    expect(sheet.getStyle()).toMatch(/\.[\w-]+::before \{content:"x";\}/);
    expect(sheet.getStyle()).toMatch(/\.[\w-]+::placeholder \{color:red;\}/);
  });

  it('emits combinator postconditions with spaced selectors', () => {
    const sheet = createSheet('edgeCombinators', null);
    const styles = sheet.create({
      box: {
        '*': { color: 'purple' },
        '+ .edge-sibling': { color: 'blue' },
        '> .edge-child': { color: 'red' },
        '~ .edge-general': { color: 'green' },
      },
    });

    expect(styles.box.size).toBe(4);
    expect(sheet.getStyle()).toContain('> .edge-child {color:red;}');
    expect(sheet.getStyle()).toContain('+ .edge-sibling {color:blue;}');
    expect(sheet.getStyle()).toContain('~ .edge-general {color:green;}');
    expect(sheet.getStyle()).toContain('* {color:purple;}');
  });

  it('emits immediate postconditions without a space', () => {
    const sheet = createSheet('edgeImmediate', null);
    const styles = sheet.create({
      box: {
        '*.edge-inner': { color: 'red' },
        '&.edge-active': { color: 'blue' },
        '&:hover': { color: 'green' },
      },
    });

    expect(styles.box.size).toBe(3);
    expect(sheet.getStyle()).toContain('*.edge-inner {color:red;}');
    expect(sheet.getStyle()).toMatch(/\.[\w-]+\.edge-active \{color:blue;\}/);
    expect(sheet.getStyle()).toMatch(/\.[\w-]+:hover \{color:green;\}/);
  });

  it('returns equal sets with a single rule for duplicate creates', () => {
    const sheet = createSheet('edgeDuplicates', null);
    const first = sheet.create({ a: { color: 'red' } });
    const before = sheet.getStyle();
    const second = sheet.create({ a: { color: 'red' } });

    expect(second.a).toEqual(first.a);
    expect(sheet.getStyle()).toBe(before);
    expect(sheet.getStyle().match(/color:red/g)).toHaveLength(1);
  });

  it('works with an empty-string sheet name', () => {
    const sheet = createSheet('');
    expect(() => sheet.create({ box: { color: 'red' } })).not.toThrow();
    const styles = sheet.create({ box: { color: 'red' } });

    expect(styles.box.size).toBe(1);
    expect(sheet.getStyle()).toContain('color:red');
    expect(sheet.isApplied()).toBe(true);
  });

  it('preserves unknown cx tokens while collapsing exact duplicates', () => {
    expect(cx('a', 'a', 'b')).toBe('a b');

    const sheet = createSheet('edgeCustom', null);
    const styles = sheet.create({ box: { color: 'red' } });
    const generated = Array.from(styles.box).join(' ');

    expect(cx('edge-util', styles.box, 'edge-util')).toBe(
      `${generated} edge-util`,
    );
  });

  it('keeps rule identities isolated when sheet names collide after sanitizing', () => {
    const first = createSheet('accept/a', null);
    const second = createSheet('accept?a', null);

    // `font-family:Aa` and `font-family:BB` share a declaration hash and
    // both sheet names sanitize to `accept_a`, so without an identity
    // digest both sheets would emit the same class for different rules.
    const a = first.create({ a: { fontFamily: 'Aa' } });
    const b = second.create({ b: { fontFamily: 'BB' } });

    expect(Array.from(a.a)).not.toEqual(Array.from(b.b));
    expect(first.getStyle()).toContain('font-family:Aa;');
    expect(first.getStyle()).not.toContain('font-family:BB;');
    expect(second.getStyle()).toContain('font-family:BB;');
    expect(second.getStyle()).not.toContain('font-family:Aa;');
  });

  it('keeps keyframes names isolated when sheet names collide after sanitizing', () => {
    const first = createSheet('accept/a', null);
    const second = createSheet('accept?a', null);

    const a = first.keyframes({ spin: { to: { opacity: '1' } } });
    const b = second.keyframes({ spin: { to: { opacity: '1' } } });

    expect(a.spin).not.toBe(b.spin);
    expect(first.getStyle()).toContain(`@keyframes ${a.spin} {`);
    expect(second.getStyle()).toContain(`@keyframes ${b.spin} {`);
  });

  it('keeps identities isolated when digests collide after sanitizing', () => {
    // '/ʼ' (code units [47, 700]) and '?Ì' ([63, 204]) share both the
    // sanitized prefix and a 32-bit digest, so only an injective encoding
    // of the original name keeps them apart. Paired with the known
    // declaration-hash collision below, both sheets would otherwise emit
    // the exact same class for different rules.
    const first = createSheet('/ʼ', null);
    const second = createSheet('?Ì', null);

    const a = first.create({ a: { fontFamily: 'Aa' } });
    const b = second.create({ b: { fontFamily: 'BB' } });

    expect(Array.from(a.a)).not.toEqual(Array.from(b.b));
    expect(first.getStyle()).toContain('font-family:Aa;');
    expect(first.getStyle()).not.toContain('font-family:BB;');
    expect(second.getStyle()).toContain('font-family:BB;');
    expect(second.getStyle()).not.toContain('font-family:Aa;');
  });

  it('keeps scope classes isolated when sheet names collide after sanitizing', () => {
    const first = createSheet('accept/a', null);
    const second = createSheet('accept?a', null);

    // Identical declarations, so only the sheet identity can distinguish
    // the two scopes: without a digest both sets would be equal.
    const a = first.create({ box: { ':hover': { color: 'red' } } });
    const b = second.create({ box: { ':hover': { color: 'red' } } });

    expect(Array.from(a.box)).not.toEqual(Array.from(b.box));
  });

  it('does not share state between unmounted sheets with the same name', () => {
    const first = createSheet('edgeUnmounted', null);
    first.create({ box: { color: 'red' } });

    const second = createSheet('edgeUnmounted', null);
    second.create({ box: { width: '10px' } });

    expect(second.getStyle()).toContain('width:10px;');
    expect(second.getStyle()).not.toContain('color:red;');
    expect(first.getStyle()).toContain('color:red;');
    expect(first.getStyle()).not.toContain('width:10px;');
  });
});
