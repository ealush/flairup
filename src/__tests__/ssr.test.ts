// @vitest-environment node
import { createSheet, cx } from '../index.js';
import { describe, expect, it } from 'vitest';

function normalize(css: string, name: string): string {
  return css.split(name).join('SHEET');
}

function anonymize(css: string): string {
  // Conditional classes embed their scope identity, which is intentionally
  // per-sheet, so compare structure with consistent placeholders instead of
  // raw hashes: same shape, same distinct-class count, same order.
  const mapping = new Map<string, string>();
  return css.replace(/SHEET_[A-Za-z0-9_-]+/g, (token) => {
    let placeholder = mapping.get(token);
    if (!placeholder) {
      placeholder = `SHEET_C${mapping.size}`;
      mapping.set(token, placeholder);
    }
    return placeholder;
  });
}

function classForDeclaration(
  css: string,
  classes: Set<string>,
  declaration: string,
): string {
  const found = Array.from(classes).find((className) =>
    css.includes(`.${className} {${declaration}}`),
  );

  if (!found) {
    throw new Error(`No class generated for ${declaration}`);
  }

  return found;
}

function buildStylesheet(name: string): string {
  const sheet = createSheet(name, null);
  sheet.create({
    box: {
      '--': { '--ssr-tone': 'red' },
      ':hover': { color: 'blue' },
      '@media (max-width: 600px)': { width: '10px' },
      color: 'red',
    },
  });
  sheet.keyframes({ spin: { to: { opacity: '1' } } });
  return sheet.getStyle();
}

describe('ssr without a document', () => {
  it('emits a multi-rule stylesheet string', () => {
    const sheet = createSheet('ssrMain', null);
    const styles = sheet.create({
      box: {
        ':hover': { color: 'blue' },
        '@media (max-width: 600px)': { color: 'green' },
        color: 'red',
        width: '10px',
      },
    });

    expect(styles.box.size).toBe(4);
    const css = sheet.getStyle();
    expect(css).toContain('color:red;');
    expect(css).toContain('width:10px;');
    expect(css).toMatch(/\.[\w-]+:hover \{color:blue;\}/);
    expect(css).toContain('@media (max-width: 600px) {');
    expect(css).toContain('color:green;');
  });

  it('numbers keyframes sequentially across calls', () => {
    const sheet = createSheet('ssrFrames', null);
    const first = sheet.keyframes({
      fade: { from: { opacity: '0' }, to: { opacity: '1' } },
    });
    const second = sheet.keyframes({
      slide: { from: { opacity: '1' }, to: { opacity: '0' } },
    });

    expect(first.fade).toBe('ssrFrames_0_fade');
    expect(second.slide).toBe('ssrFrames_1_slide');
    expect(sheet.getStyle()).toContain('@keyframes ssrFrames_0_fade {');
    expect(sheet.getStyle()).toContain('@keyframes ssrFrames_1_slide {');
  });

  it('resolves cx conflicts with last-wins token output', () => {
    const sheet = createSheet('ssrCx', null);
    const red = sheet.create({ red: { color: 'red' } });
    const blue = sheet.create({ blue: { color: 'blue' } });

    expect(cx(red.red, blue.blue)).toBe(Array.from(blue.blue).join(' '));
    expect(cx(blue.blue, red.red)).toBe(Array.from(red.red).join(' '));
  });

  it('reports isApplied as false for a null root node', () => {
    const sheet = createSheet('ssrUnmounted', null);
    sheet.create({ box: { color: 'red' } });

    expect(sheet.isApplied()).toBe(false);
    expect(sheet.getStyle()).toContain('color:red');
  });

  it('does not throw when document is undefined', () => {
    expect(typeof document).toBe('undefined');
    expect(() => {
      const sheet = createSheet('ssrNoDom', null);
      const styles = sheet.create({
        box: { ':hover': { color: 'blue' }, color: 'red' },
      });
      sheet.keyframes({ fade: { to: { opacity: '1' } } });
      cx(styles.box);
      sheet.getStyle();
      sheet.isApplied();
    }).not.toThrow();
  });

  it('produces structurally identical output modulo the name prefix', () => {
    const alpha = buildStylesheet('ssrAlpha');
    const beta = buildStylesheet('ssrBeta');

    expect(alpha).toContain('ssrAlpha');
    expect(beta).toContain('ssrBeta');
    expect(anonymize(normalize(alpha, 'ssrAlpha'))).toBe(
      anonymize(normalize(beta, 'ssrBeta')),
    );
  });

  it('emits a single rule for duplicate declarations', () => {
    const sheet = createSheet('ssrDedupe', null);
    sheet.create({ a: { color: 'red' } });
    const before = sheet.getStyle();
    sheet.create({ b: { color: 'red' } });

    expect(sheet.getStyle()).toBe(before);
    expect(sheet.getStyle().match(/color:red/g)).toHaveLength(1);
  });

  it('resolves css variables per variable in cx output', () => {
    const sheet = createSheet('ssrVars', null);
    const first = sheet.create({
      first: { '--': { '--ssr-a': 'red', '--ssr-b': '4px' } },
    });
    const second = sheet.create({
      second: { '--': { '--ssr-a': 'blue' } },
    });
    const css = sheet.getStyle();

    const firstA = classForDeclaration(css, first.first, '--ssr-a:red;');
    const firstB = classForDeclaration(css, first.first, '--ssr-b:4px;');
    const secondA = classForDeclaration(css, second.second, '--ssr-a:blue;');

    const output = cx(first.first, second.second);
    expect(output).toContain(firstB);
    expect(output).toContain(secondA);
    expect(output).not.toContain(firstA);
  });
});
