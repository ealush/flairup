import { createSheet, cx } from '../index.js';
import { afterEach, describe, expect, it } from 'vitest';

afterEach(() => {
  document.querySelectorAll('style[id^="flairup-"]').forEach((node) => {
    node.remove();
  });
  document.body.innerHTML = '';
});

function classNames(classes: Set<string>): string[] {
  return Array.from(classes);
}

function computedStyleFor(classes: string | undefined): CSSStyleDeclaration {
  const element = document.createElement('div');
  element.className = classes ?? '';
  document.body.appendChild(element);
  return getComputedStyle(element);
}

function classForDeclaration(
  css: string,
  classes: Set<string>,
  selectorSuffix: string,
  declaration: string,
): string {
  const found = classNames(classes).find((className) =>
    css.includes(`.${className}${selectorSuffix} {${declaration}}`),
  );

  if (!found) {
    throw new Error(`No class generated for ${declaration}`);
  }

  return found;
}

describe('browser-visible composition acceptance', () => {
  it('makes the last cx argument win in either order, regardless of creation order', () => {
    const sheet = createSheet('acceptCxOrder');
    const red = sheet.create({ red: { color: 'red' } });
    const blue = sheet.create({ blue: { color: 'blue' } });

    expect(computedStyleFor(cx(red.red, blue.blue)).color).toBe(
      'rgb(0, 0, 255)',
    );
    expect(computedStyleFor(cx(blue.blue, red.red)).color).toBe(
      'rgb(255, 0, 0)',
    );
  });

  it('preserves non-conflicting declarations while replacing only a conflicting declaration', () => {
    const sheet = createSheet('acceptPartial');
    const base = sheet.create({
      base: { color: 'red', height: '10px', width: '20px' },
    });
    const override = sheet.create({ override: { color: 'blue' } });

    const style = computedStyleFor(cx(base.base, override.override));
    expect(style.color).toBe('rgb(0, 0, 255)');
    expect(style.height).toBe('10px');
    expect(style.width).toBe('20px');
  });

  it('resolves shorthand/longhand overlap according to cx order', () => {
    const sheet = createSheet('acceptShorthand');
    const top = sheet.create({ top: { marginTop: '1px' } });
    const all = sheet.create({ all: { margin: '2px' } });

    expect(computedStyleFor(cx(all['all'], top['top'])).marginTop).toBe('1px');
    expect(computedStyleFor(cx(top['top'], all['all'])).marginTop).toBe('2px');
  });

  it('resolves grouped CSS variables by cx order and preserves unrelated variables', () => {
    const sheet = createSheet('acceptVariables');
    const base = sheet.create({
      base: { '--': { '--tone': 'red', '--space': '4px' } },
    });
    const override = sheet.create({
      override: { '--': { '--tone': 'blue' } },
    });

    const overridden = computedStyleFor(cx(base.base, override.override));
    expect(overridden.getPropertyValue('--tone')).toBe('blue');
    expect(overridden.getPropertyValue('--space')).toBe('4px');

    const restored = computedStyleFor(cx(override.override, base.base));
    expect(restored.getPropertyValue('--tone')).toBe('red');
    expect(restored.getPropertyValue('--space')).toBe('4px');
  });

  it('makes conditional declarations independently composable', () => {
    const sheet = createSheet('acceptConditional', null);
    const override = sheet.create({
      override: { ':hover': { color: 'blue' } },
    });
    const base = sheet.create({
      base: { ':hover': { color: 'red', height: '10px' } },
    });
    const css = sheet.getStyle();
    const baseColor = classForDeclaration(
      css,
      base.base,
      ':hover',
      'color:red;',
    );
    const baseHeight = classForDeclaration(
      css,
      base.base,
      ':hover',
      'height:10px;',
    );
    const overrideColor = classForDeclaration(
      css,
      override.override,
      ':hover',
      'color:blue;',
    );
    const output = cx(base.base, override.override).split(' ');

    expect(baseColor).not.toBe(baseHeight);
    expect(output).toContain(baseHeight);
    expect(output).toContain(overrideColor);
    expect(output).not.toContain(baseColor);
  });

  it('does not treat the same property in different conditional contexts as a conflict', () => {
    const sheet = createSheet('acceptContexts', null);
    const styles = sheet.create({
      button: {
        color: 'black',
        ':hover': { color: 'red' },
        ':focus': { color: 'blue' },
        '@media (max-width: 600px)': { color: 'green' },
      },
    });

    expect(cx(styles.button).split(' ')).toHaveLength(styles.button.size);
  });

  it('preserves unknown utility classes while resolving generated classes', () => {
    const sheet = createSheet('acceptUtilities', null);
    const red = sheet.create({ red: { color: 'red' } });
    const blue = sheet.create({ blue: { color: 'blue' } });
    const blueClass = classNames(blue.blue)[0];

    expect(cx('external flex', red.red, false, null, blue.blue)).toBe(
      `external flex ${blueClass}`,
    );
  });
});

describe('rule identity sanity checks', () => {
  it('survives a stable-hash collision without aliasing distinct declarations', () => {
    const sheet = createSheet('acceptCollision');
    // "Aa" and "BB" collide under the Java-style 31x string hash used here.
    const first = sheet.create({ first: { fontFamily: 'Aa' } });
    const second = sheet.create({ second: { fontFamily: 'BB' } });

    expect(first.first).not.toEqual(second.second);
    expect(computedStyleFor(cx(first.first)).fontFamily).toBe('Aa');
    expect(computedStyleFor(cx(second.second)).fontFamily).toBe('BB');
  });

  it.each([
    '@scope/package',
    'name with spaces',
    'name:with.dot',
    'ユニコード',
  ])('accepts an arbitrary package/sheet name: %s', (name) => {
    const sheet = createSheet(name);
    const styles = sheet.create({ box: { color: 'red' } });
    const className = classNames(styles.box)[0];

    expect(sheet.isApplied()).toBe(true);
    expect(computedStyleFor(className).color).toBe('rgb(255, 0, 0)');
  });

  it('does not collide when two unsafe names normalize to similar identifiers', () => {
    const slash = createSheet('accept/a');
    const question = createSheet('accept?a');
    const red = slash.create({ box: { color: 'red' } });
    const blue = question.create({ box: { color: 'blue' } });

    expect(red.box).not.toEqual(blue.box);
    expect(computedStyleFor(classNames(red.box)[0]).color).toBe(
      'rgb(255, 0, 0)',
    );
    expect(computedStyleFor(classNames(blue.box)[0]).color).toBe(
      'rgb(0, 0, 255)',
    );
  });
});
