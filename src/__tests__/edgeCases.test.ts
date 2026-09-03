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
});
