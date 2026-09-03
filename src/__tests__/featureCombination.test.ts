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

  it('retains the unaffected longhands of an earlier shorthand', () => {
    const sheet = createSheet('featShorthand', null);
    const top = sheet.create({ top: { marginTop: '1px' } });
    const all = sheet.create({ all: { margin: '2px' } });
    const css = sheet.getStyle();

    // A single-token shorthand expands into one atomic class per longhand.
    expect(all['all']?.size).toBe(8);
    const allTop = classForDeclaration(css, all['all'], '', 'margin-top:2px;');
    const allRight = classForDeclaration(
      css,
      all['all'],
      '',
      'margin-right:2px;',
    );

    // A later longhand wins only its own side; the other sides survive.
    const forward = cx(all['all'], top['top']);
    expect(forward).toContain(classNames(top['top']).join(' '));
    expect(forward).toContain(allRight);
    expect(forward).not.toContain(allTop);

    // A later shorthand still wins every side.
    expect(cx(top['top'], all['all'])).toBe(classNames(all['all']).join(' '));

    const left = sheet.create({ left: { paddingLeft: '3px' } });
    const padded = sheet.create({ padded: { padding: '4px' } });
    expect(padded['padded']?.size).toBe(8);
    const paddedLeft = classForDeclaration(
      sheet.getStyle(),
      padded['padded'],
      '',
      'padding-left:4px;',
    );
    const paddedRight = classForDeclaration(
      sheet.getStyle(),
      padded['padded'],
      '',
      'padding-right:4px;',
    );
    const paddedWins = cx(left['left'], padded['padded']);
    expect(paddedWins).toBe(classNames(padded['padded']).join(' '));
    const leftWins = cx(padded['padded'], left['left']);
    expect(leftWins).toContain(classNames(left['left']).join(' '));
    expect(leftWins).toContain(paddedRight);
    expect(leftWins).not.toContain(paddedLeft);

    const edge = sheet.create({ edge: { top: '5px' } });
    const inset = sheet.create({ inset: { inset: '0' } });
    expect(inset['inset']?.size).toBe(4);
    const insetTop = classForDeclaration(
      sheet.getStyle(),
      inset['inset'],
      '',
      'top:0;',
    );
    const insetRight = classForDeclaration(
      sheet.getStyle(),
      inset['inset'],
      '',
      'right:0;',
    );
    const edgeWins = cx(inset['inset'], edge['edge']);
    expect(edgeWins).toContain(classNames(edge['edge']).join(' '));
    expect(edgeWins).toContain(insetRight);
    expect(edgeWins).not.toContain(insetTop);
    expect(cx(edge['edge'], inset['inset'])).toBe(
      classNames(inset['inset']).join(' '),
    );

    const side = sheet.create({ side: { borderTopColor: 'blue' } });
    const border = sheet.create({ border: { borderColor: 'red' } });
    expect(border['border']?.size).toBe(4);
    const borderTop = classForDeclaration(
      sheet.getStyle(),
      border['border'],
      '',
      'border-top-color:red;',
    );
    const borderRight = classForDeclaration(
      sheet.getStyle(),
      border['border'],
      '',
      'border-right-color:red;',
    );
    const sideWins = cx(border['border'], side['side']);
    expect(sideWins).toContain(classNames(side['side']).join(' '));
    expect(sideWins).toContain(borderRight);
    expect(sideWins).not.toContain(borderTop);
    expect(cx(side['side'], border['border'])).toBe(
      classNames(border['border']).join(' '),
    );
  });

  it('distributes multi-value shorthands positionally per side', () => {
    const sheet = createSheet('featShorthandMulti', null);

    const two = sheet.create({ two: { margin: '2px 4px' } });
    expect(two['two']?.size).toBe(4);
    const css = sheet.getStyle();
    const top2 = classForDeclaration(css, two['two'], '', 'margin-top:2px;');
    const right4 = classForDeclaration(
      css,
      two['two'],
      '',
      'margin-right:4px;',
    );
    const bottom2 = classForDeclaration(
      css,
      two['two'],
      '',
      'margin-bottom:2px;',
    );
    const left4 = classForDeclaration(css, two['two'], '', 'margin-left:4px;');

    // A later longhand wins only its side; positional survivors keep
    // their assigned values.
    const later = sheet.create({ later: { marginTop: '1px' } });
    const won = cx(two['two'], later['later']);
    expect(won).toContain(classNames(later['later']).join(' '));
    expect(won).toContain(right4);
    expect(won).toContain(bottom2);
    expect(won).toContain(left4);
    expect(won).not.toContain(top2);

    const three = sheet.create({ three: { padding: '1px 2px 3px' } });
    expect(three['three']?.size).toBe(4);
    const cssThree = sheet.getStyle();
    classForDeclaration(cssThree, three['three'], '', 'padding-top:1px;');
    classForDeclaration(cssThree, three['three'], '', 'padding-right:2px;');
    classForDeclaration(cssThree, three['three'], '', 'padding-bottom:3px;');
    classForDeclaration(cssThree, three['three'], '', 'padding-left:2px;');

    const pair = sheet.create({ pair: { overflow: 'hidden visible' } });
    expect(pair['pair']?.size).toBe(2);
    const cssPair = sheet.getStyle();
    classForDeclaration(cssPair, pair['pair'], '', 'overflow-x:hidden;');
    classForDeclaration(cssPair, pair['pair'], '', 'overflow-y:visible;');

    const gap = sheet.create({ gap: { gap: '4px 8px' } });
    expect(gap['gap']?.size).toBe(2);
  });

  it('keeps unsafe shorthand shapes atomic', () => {
    const sheet = createSheet('featShorthandAtomic', null);

    // A bare var()/env() reference can resolve to multiple tokens, which
    // would make expanded longhands invalid, so it stays one atomic class.
    const space = sheet.create({ space: { margin: 'var(--space)' } });
    expect(space['space']?.size).toBe(1);
    const env = sheet.create({ env: { padding: 'env(safe-area-inset-top)' } });
    expect(env['env']?.size).toBe(1);

    // Over-count values and multi-token elliptical radii are invalid CSS;
    // staying atomic preserves the browser dropping the whole declaration.
    const five = sheet.create({ five: { margin: '1px 2px 3px 4px 5px' } });
    expect(five['five']?.size).toBe(1);
    const slash = sheet.create({
      slash: { borderRadius: '1px 2px/3px 4px' },
    });
    expect(slash['slash']?.size).toBe(1);

    // A single elliptical token distributes verbatim: every corner accepts
    // the same elliptical value.
    const elliptical = sheet.create({
      elliptical: { borderRadius: '10px/20px' },
    });
    expect(elliptical['elliptical']?.size).toBe(4);
  });

  it('preserves !important across shorthand expansion', () => {
    const sheet = createSheet('featShorthandImportant', null);

    const all = sheet.create({ all: { margin: '2px !important' } });
    expect(all['all']?.size).toBe(8);
    const css = sheet.getStyle();
    classForDeclaration(css, all['all'], '', 'margin-top:2px !important;');
    classForDeclaration(css, all['all'], '', 'margin-left:2px !important;');

    const two = sheet.create({ two: { padding: '1px 2px !important' } });
    expect(two['two']?.size).toBe(4);
    const cssTwo = sheet.getStyle();
    classForDeclaration(cssTwo, two['two'], '', 'padding-top:1px !important;');
    classForDeclaration(
      cssTwo,
      two['two'],
      '',
      'padding-right:2px !important;',
    );
  });

  it('expands single tokens, including functional notation and numbers', () => {
    const sheet = createSheet('featShorthandSingle', null);

    const calc = sheet.create({ calc: { margin: 'calc(1px + 2px)' } });
    expect(calc['calc']?.size).toBe(8);
    const nested = sheet.create({
      nested: { margin: 'calc(var(--gap) * 2)' },
    });
    expect(nested['nested']?.size).toBe(8);
    const zero = sheet.create({
      zero: { margin: 0 as unknown as string },
    });
    expect(zero['zero']?.size).toBe(8);
    const hidden = sheet.create({ hidden: { overflow: 'hidden' } });
    expect(hidden['hidden']?.size).toBe(2);
  });

  it('resolves non-distributive shorthands as one atomic unit', () => {
    const sheet = createSheet('featShorthandGrouped', null);

    // `background` resets longhands to values that cannot be derived from
    // the shorthand text, so it cannot expand and stays atomic.
    const fill = sheet.create({ fill: { backgroundColor: 'blue' } });
    const background = sheet.create({ background: { background: 'red' } });
    expect(background['background']?.size).toBe(1);
    expect(cx(background['background'], fill['fill'])).toBe(
      classNames(fill['fill']).join(' '),
    );
    expect(cx(fill['fill'], background['background'])).toBe(
      classNames(background['background']).join(' '),
    );

    const size = sheet.create({ size: { fontSize: '20px' } });
    const font = sheet.create({ font: { font: 'italic bold 12px serif' } });
    expect(font['font']?.size).toBe(1);
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
