import { createSheet, cx } from '../index.js';
import type { Styles } from '../index.js';
import { afterEach, describe, expect, it } from 'vitest';

afterEach(() => {
  document.querySelectorAll('style[id^="flairup-"]').forEach((node) => {
    node.remove();
  });
  document.body.innerHTML = '';
});

function pair(name: string, first: Styles, second: Styles) {
  const sheet = createSheet(name, null);
  const a = sheet.create({ a: first });
  const b = sheet.create({ b: second });
  return { first: a.a, second: b.b };
}

function names(set: Set<string> | undefined): string {
  return Array.from(set ?? []).join(' ');
}

describe('cx partial conflicts', () => {
  it('lets a later token win even when it was generated first', () => {
    const { second, first } = pair(
      'cxPartialFullReversed',
      { color: 'blue' },
      { color: 'red' },
    );

    expect(cx(second, first)).toBe(names(first));
  });

  it('resolves an atomic shorthand as one unit in favor of the later token', () => {
    const { first, second } = pair(
      'cxPartialBackground',
      { background: 'red' },
      { backgroundColor: 'blue' },
    );

    expect(cx(first, second)).toBe(names(second));
  });

  it('drops an earlier reset shorthand when a later class specializes one longhand', () => {
    const { first, second } = pair(
      'cxPartialResetSpecialize',
      { background: 'none' },
      { backgroundImage: 'url(b.png)' },
    );

    expect(cx(first, second)).toBe(names(second));
  });

  it('keeps the non-conflicting declarations of a partially overridden scope', () => {
    const sheet = createSheet('cxPartialScopeKeepsSiblings');
    const base = sheet.create({ base: { border: '0', background: 'none' } });
    const over = sheet.create({ over: { backgroundImage: 'url(b.png)' } });

    const output = cx(base.base, over.over);
    const [borderClass, backgroundClass] = Array.from(base.base ?? []);
    const [imageClass] = Array.from(over.over ?? []);

    expect(output).toContain(borderClass);
    expect(output).not.toContain(backgroundClass);
    expect(output).toContain(imageClass);
  });

  it('renders no image once the shorthand loses', () => {
    const sheet = createSheet('cxPartialImage');
    const base = sheet.create({ base: { background: 'red url(a.png)' } });
    const over = sheet.create({ over: { backgroundColor: 'blue' } });

    const element = document.createElement('div');
    element.className = cx(base.base, over.over);
    document.body.appendChild(element);
    const style = getComputedStyle(element);
    expect(style.backgroundColor).toBe('rgb(0, 0, 255)');
    expect(style.backgroundImage).not.toContain('a.png');
  });

  it('resolves the same way when the override was generated first', () => {
    const { first: over, second: base } = pair(
      'cxPartialBackgroundReversed',
      { backgroundColor: 'blue' },
      { background: 'red' },
    );

    expect(cx(base, over)).toBe(names(over));
  });

  it('preserves other selector contexts of a partially overridden scope', () => {
    const { first, second } = pair(
      'cxPartialHover',
      { color: 'red', '&:hover': { color: 'green' } },
      { color: 'blue' },
    );

    const output = cx(first, second);
    const [redClass, hoverClass] = Array.from(first ?? []);
    const [blueClass] = Array.from(second ?? []);
    expect(output).not.toContain(redClass);
    expect(output).toContain(hoverClass);
    expect(output).toContain(blueClass);
  });

  it('resolves an atomic font as one unit in favor of the later token', () => {
    const { first, second } = pair(
      'cxPartialFont',
      { font: '12px serif' },
      { fontWeight: '700' },
    );

    expect(cx(first, second)).toBe(names(second));
  });

  it('resolves an opaque shorthand as one unit in favor of the later token', () => {
    const { first, second } = pair(
      'cxPartialOpaque',
      { margin: 'var(--gap)' },
      { marginTop: '1px' },
    );

    expect(cx(first, second)).toBe(names(second));
  });

  it('lets a later border shorthand fully replace an earlier image', () => {
    const { first, second } = pair(
      'cxBorderImage',
      { borderImage: 'url(a.png) 30' },
      { border: '1px solid red' },
    );

    expect(cx(first, second)).toBe(names(second));
  });

  it('lets a later image fully replace an earlier border', () => {
    const { first, second } = pair(
      'cxBorderImageAdditive',
      { border: '1px solid red' },
      { borderImage: 'url(a.png) 30' },
    );

    expect(cx(first, second)).toBe(names(second));
  });

  it('resolves an unexpandable radius as one unit in favor of the later token', () => {
    const { first, second } = pair(
      'cxPartialRadius',
      { borderRadius: '1px 2px 3px 4px 5px' },
      { borderTopLeftRadius: '0' },
    );

    expect(cx(first, second)).toBe(names(second));
  });
});
