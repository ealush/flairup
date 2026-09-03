import { createSheet, cx } from '../index.js';
import { afterEach, describe, expect, it } from 'vitest';

const MEDIA = '@media (max-width: 600px)' as const;

afterEach(() => {
  document.querySelectorAll('style').forEach((styleTag) => {
    styleTag.remove();
  });
});

describe('cx deterministic composition', () => {
  it('resolves conflicting properties in favor of the last argument', () => {
    const sheet = createSheet('cxLast', null);
    const base = sheet.create({
      base: { color: 'red' },
    });
    const override = sheet.create({
      override: { color: 'blue' },
    });

    expect(cx(base.base, override.override)).toBe(
      Array.from(override.override).join(' '),
    );
  });

  it('is independent of creation order', () => {
    const sheet = createSheet('cxOrder', null);
    const first = sheet.create({
      first: { color: 'red' },
    });
    const second = sheet.create({
      second: { color: 'blue' },
    });

    expect(cx(second.second, first.first)).toBe(
      Array.from(first.first).join(' '),
    );
    expect(cx(first.first, second.second)).toBe(
      Array.from(second.second).join(' '),
    );
  });

  it('keeps non-conflicting properties', () => {
    const sheet = createSheet('cxKeep', null);
    const base = sheet.create({
      base: { color: 'red' },
    });
    const extra = sheet.create({
      extra: { height: '100px' },
    });

    const output = cx(base.base, extra.extra);
    Array.from(base.base).forEach((className) => {
      expect(output).toContain(className);
    });
    Array.from(extra.extra).forEach((className) => {
      expect(output).toContain(className);
    });
  });

  it('deduplicates repeated tokens', () => {
    const sheet = createSheet('cxDedupe', null);
    const base = sheet.create({
      base: { color: 'red' },
    });

    expect(cx(base.base, base.base)).toBe(
      Array.from(base.base).join(' '),
    );
  });

  it('resolves conflicts through Set, array and object forms', () => {
    const sheet = createSheet('cxForms', null);
    const base = sheet.create({
      base: { color: 'red' },
    });
    const override = sheet.create({
      override: { color: 'blue' },
    });
    const baseClass = Array.from(base.base).join(' ');
    const overrideClass = Array.from(override.override).join(' ');

    expect(cx([base.base], override.override)).toBe(overrideClass);
    expect(cx({ [baseClass]: true, [overrideClass]: true })).toBe(
      overrideClass,
    );
    expect(cx({ [baseClass]: true, [overrideClass]: false })).toBe(baseClass);
  });

  it('keeps pseudo-state rules alongside global rules for the same property', () => {
    const sheet = createSheet('cxPseudo', null);
    const styles = sheet.create({
      button: {
        color: 'red',
        ':hover': { color: 'blue' },
      },
    });

    const output = cx(styles.button);
    expect(output.split(' ').filter(Boolean).length).toBe(styles.button.size);
    Array.from(styles.button).forEach((className) => {
      expect(output).toContain(className);
    });
  });

  it('keeps media rules alongside global rules for the same property', () => {
    const sheet = createSheet('cxMedia', null);
    const styles = sheet.create({
      button: {
        color: 'red',
        [MEDIA]: { color: 'blue' },
      },
    });

    const output = cx(styles.button);
    expect(output.split(' ').filter(Boolean).length).toBe(styles.button.size);
    Array.from(styles.button).forEach((className) => {
      expect(output).toContain(className);
    });
  });

  it('resolves css-variable conflicts in favor of the last argument', () => {
    const sheet = createSheet('cxVars', null);
    const first = sheet.create({
      first: { '--': { '--brand': 'red' } },
    });
    const second = sheet.create({
      second: { '--': { '--brand': 'blue' } },
    });

    expect(cx(first.first, second.second)).toBe(
      Array.from(second.second).join(' '),
    );
    expect(cx(second.second, first.first)).toBe(
      Array.from(first.first).join(' '),
    );
  });
});
