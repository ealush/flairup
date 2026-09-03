import { createSheet, cx } from '../index.js';
import { afterEach, describe, expect, it } from 'vitest';

afterEach(() => {
  document.querySelectorAll('style[id^="flairup-"]').forEach((node) => {
    node.remove();
  });
  document.body.innerHTML = '';
});

function classNames(classes: Set<string> | undefined): string[] {
  return Array.from(classes ?? []);
}

function computedStyleFor(classes: string): CSSStyleDeclaration {
  const element = document.createElement('div');
  element.className = classes;
  document.body.appendChild(element);
  return getComputedStyle(element);
}

function classForDeclaration(
  css: string,
  classes: Set<string> | undefined,
  suffix: string,
  declaration: string,
): string {
  const found = classNames(classes).find((className) =>
    css.includes(`.${className}${suffix} {${declaration}}`),
  );

  if (!found) {
    throw new Error(`No class generated for ${declaration}`);
  }

  return found;
}

describe('feature combinations', () => {
  it('emits every combined rule with correct selectors', () => {
    const sheet = createSheet('featCombo', null);
    const styles = sheet.create({
      '.feat-top': { button: { color: 'black' } },
      button: {
        '--': { '--feat-tone': 'red' },
        ':focus': { color: 'green' },
        ':hover': { color: 'blue' },
        '@media (max-width: 600px)': { color: 'purple' },
        color: 'red',
      },
    });
    const frames = sheet.keyframes({
      featFade: { from: { opacity: '0' }, to: { opacity: '1' } },
    });
    const css = sheet.getStyle();

    expect(styles.button.size).toBe(6);
    expect(css).toMatch(/\.feat-top \.[\w-]+ \{color:black;\}/);
    const global = classForDeclaration(css, styles.button, '', 'color:red;');
    const hover = classForDeclaration(
      css,
      styles.button,
      ':hover',
      'color:blue;',
    );
    const focus = classForDeclaration(
      css,
      styles.button,
      ':focus',
      'color:green;',
    );
    const tone = classForDeclaration(
      css,
      styles.button,
      '',
      '--feat-tone:red;',
    );
    expect(new Set([global, hover, focus, tone]).size).toBe(4);
    expect(css).toContain('@media (max-width: 600px) {');
    expect(css.slice(css.indexOf('@media (max-width: 600px)'))).toContain(
      'color:purple;',
    );
    expect(css).toContain('@keyframes');
    expect(css).toContain(frames.featFade);
    expect(cx(styles.button).split(' ').filter(Boolean)).toHaveLength(
      styles.button.size,
    );
  });

  it('resolves a base-color conflict in favor of the last cx argument', () => {
    const sheet = createSheet('featCxBase', null);
    const base = sheet.create({ base: { color: 'red' } });
    const override = sheet.create({ override: { color: 'blue' } });

    expect(cx(base.base, override.override)).toBe(
      classNames(override.override).join(' '),
    );
    expect(cx(override.override, base.base)).toBe(
      classNames(base.base).join(' '),
    );
  });

  it('resolves hover conflicts independently of the base color', () => {
    const sheet = createSheet('featCxHover', null);
    const base = sheet.create({
      base: { ':hover': { color: 'red' }, color: 'red' },
    });
    const override = sheet.create({
      override: { ':hover': { color: 'blue' } },
    });
    const css = sheet.getStyle();

    const baseGlobal = classForDeclaration(css, base.base, '', 'color:red;');
    const baseHover = classForDeclaration(
      css,
      base.base,
      ':hover',
      'color:red;',
    );
    const overrideHover = classForDeclaration(
      css,
      override.override,
      ':hover',
      'color:blue;',
    );
    expect(baseGlobal).not.toBe(baseHover);

    const output = cx(base.base, override.override);
    expect(output).toContain(baseGlobal);
    expect(output).toContain(overrideHover);
    expect(output).not.toContain(baseHover);
  });

  it('keeps media and focus rules alongside a global conflict', () => {
    const sheet = createSheet('featCxContexts', null);
    const styles = sheet.create({
      button: {
        ':focus': { color: 'green' },
        ':hover': { color: 'blue' },
        '@media (max-width: 600px)': { color: 'purple' },
        color: 'black',
      },
    });

    expect(cx(styles.button).split(' ').filter(Boolean)).toHaveLength(
      styles.button.size,
    );
    classNames(styles.button).forEach((className) => {
      expect(cx(styles.button)).toContain(className);
    });
  });

  it('resolves css variables per variable', () => {
    const sheet = createSheet('featCxVars', null);
    const first = sheet.create({
      first: { '--': { '--feat-a': 'red', '--feat-b': '4px' } },
    });
    const second = sheet.create({
      second: { '--': { '--feat-a': 'blue' } },
    });
    const css = sheet.getStyle();

    const firstA = classForDeclaration(css, first.first, '', '--feat-a:red;');
    const firstB = classForDeclaration(css, first.first, '', '--feat-b:4px;');
    const secondA = classForDeclaration(
      css,
      second.second,
      '',
      '--feat-a:blue;',
    );

    const output = cx(first.first, second.second);
    expect(output).toContain(firstB);
    expect(output).toContain(secondA);
    expect(output).not.toContain(firstA);
  });

  it('resolves shorthand/longhand pairs by cx order', () => {
    const sheet = createSheet('featShorthand', null);
    const top = sheet.create({ top: { marginTop: '1px' } });
    const all = sheet.create({ all: { margin: '2px' } });
    expect(cx(all['all'], top['top'])).toBe(classNames(top['top']).join(' '));
    expect(cx(top['top'], all['all'])).toBe(classNames(all['all']).join(' '));

    const left = sheet.create({ left: { paddingLeft: '3px' } });
    const padded = sheet.create({ padded: { padding: '4px' } });
    expect(cx(padded['padded'], left['left'])).toBe(
      classNames(left['left']).join(' '),
    );
    expect(cx(left['left'], padded['padded'])).toBe(
      classNames(padded['padded']).join(' '),
    );

    const edge = sheet.create({ edge: { top: '5px' } });
    const inset = sheet.create({ inset: { inset: '0' } });
    expect(cx(inset['inset'], edge['edge'])).toBe(
      classNames(edge['edge']).join(' '),
    );
    expect(cx(edge['edge'], inset['inset'])).toBe(
      classNames(inset['inset']).join(' '),
    );

    const side = sheet.create({ side: { borderTopColor: 'blue' } });
    const border = sheet.create({ border: { borderColor: 'red' } });
    expect(cx(border['border'], side['side'])).toBe(
      classNames(side['side']).join(' '),
    );
    expect(cx(side['side'], border['border'])).toBe(
      classNames(border['border']).join(' '),
    );

    const fill = sheet.create({ fill: { backgroundColor: 'blue' } });
    const background = sheet.create({ background: { background: 'red' } });
    expect(cx(background['background'], fill['fill'])).toBe(
      classNames(fill['fill']).join(' '),
    );
    expect(cx(fill['fill'], background['background'])).toBe(
      classNames(background['background']).join(' '),
    );

    const size = sheet.create({ size: { fontSize: '20px' } });
    const font = sheet.create({ font: { font: 'italic bold 12px serif' } });
    expect(cx(font['font'], size['size'])).toBe(
      classNames(size['size']).join(' '),
    );
    expect(cx(size['size'], font['font'])).toBe(
      classNames(font['font']).join(' '),
    );
  });

  it('resolves cross-sheet conflicts in favor of the last cx argument', () => {
    const red = createSheet('featCrossA', null).create({
      red: { color: 'red' },
    });
    const blue = createSheet('featCrossB', null).create({
      blue: { color: 'blue' },
    });

    expect(cx(red.red, blue.blue)).toBe(classNames(blue.blue).join(' '));
    expect(cx(blue.blue, red.red)).toBe(classNames(red.red).join(' '));
  });

  it('keeps unique classes across sequential creates with growing output', () => {
    const sheet = createSheet('featGrowth', null);
    const seen = new Set<string>();
    let previousLength = 0;

    for (let i = 0; i < 12; i++) {
      const styles = sheet.create({ box: { width: `${i}px` } });
      expect(styles.box.size).toBe(1);
      classNames(styles.box).forEach((className) => {
        expect(seen.has(className)).toBe(false);
        seen.add(className);
      });
      const css = sheet.getStyle();
      expect(css).toContain(`width:${i}px;`);
      expect(css.length).toBeGreaterThan(previousLength);
      previousLength = css.length;
    }

    expect(seen.size).toBe(12);
  });

  it('gives the same scope name distinct classes in two creates', () => {
    const sheet = createSheet('featRescope', null);
    const first = sheet.create({ button: { ':hover': { color: 'red' } } });
    const second = sheet.create({ button: { ':hover': { color: 'red' } } });

    expect(first.button).not.toEqual(second.button);
    expect(cx(first.button, second.button)).toBe(
      classNames(second.button).join(' '),
    );
    expect(cx(second.button, first.button)).toBe(
      classNames(first.button).join(' '),
    );
  });

  it('exposes generated keyframes for use in combined styles', () => {
    const sheet = createSheet('featFramesCombo', null);
    const frames = sheet.keyframes({
      featSpin: { from: { opacity: '0' }, to: { opacity: '1' } },
    });
    const styles = sheet.create({
      spinner: { animationDuration: '2s', animationName: frames.featSpin },
    });
    const css = sheet.getStyle();

    expect(styles.spinner.size).toBe(2);
    expect(css).toContain('@keyframes');
    expect(css).toContain(frames.featSpin);
    expect(css).toContain(`animation-name:${frames.featSpin};`);
    expect(css).toContain('animation-duration:2s;');
  });

  it('applies the cx winner to computed styles', () => {
    const sheet = createSheet('featWin');
    const base = sheet.create({ base: { color: 'red', width: '10px' } });
    const override = sheet.create({ override: { color: 'blue' } });

    const style = computedStyleFor(cx(base.base, override.override));
    expect(style.color).toBe('rgb(0, 0, 255)');
    expect(style.width).toBe('10px');
  });

  it('applies the reversed cx argument to computed styles', () => {
    const sheet = createSheet('featLoss');
    const base = sheet.create({ base: { color: 'red', width: '10px' } });
    const override = sheet.create({ override: { color: 'blue' } });

    const style = computedStyleFor(cx(override.override, base.base));
    expect(style.color).toBe('rgb(255, 0, 0)');
    expect(style.width).toBe('10px');
  });
});
