import { createSheet } from '../index.js';
import { describe, expect, it } from 'vitest';

function classNames(classes: Set<string>): string[] {
  return Array.from(classes);
}

describe('Rule.key selector identity regressions', () => {
  it('keeps the same condition distinct when it is a precondition or postcondition', () => {
    const sheet = createSheet('ruleKeyPrePost', null);
    const styles = sheet.create({
      ':hover': {
        box: { color: 'red' },
      },
      box: {
        ':hover': { color: 'red' },
      },
    });

    const classes = classNames(styles.box);
    const css = sheet.getStyle();

    expect(classes).toHaveLength(2);
    expect(css.match(/color:red;/g)).toHaveLength(2);
    expect(
      classes.some((className) =>
        css.includes(`:hover .${className} {color:red;}`),
      ),
    ).toBe(true);
    expect(
      classes.some((className) =>
        css.includes(`.${className}:hover {color:red;}`),
      ),
    ).toBe(true);
  });

  it('does not use a colliding scope hash as the pre/postcondition boundary', () => {
    const sheet = createSheet('ruleKeyHashCollision', null);
    // stableHash('ruleKeyHashCollision', `${preScope}\0${count}`) and the
    // postcondition-rehashed postScope produce the same scopeClassName. The
    // current Rule.key therefore aliases these selector shapes unless it
    // stores preconditions and postconditions as separate fields.
    const preScope = 'ruleKeyHashCollision_9lyaan';
    const postScope = 'post1056';
    const styles = sheet.create({
      '.state': {
        [preScope]: { color: 'red' },
      },
      [postScope]: {
        '.state': { color: 'red' },
      },
    });

    const preClasses = classNames(styles[preScope]);
    const postClasses = classNames(styles[postScope]);
    const css = sheet.getStyle();

    expect(preClasses).toHaveLength(1);
    expect(postClasses).toHaveLength(1);
    expect(preClasses[0]).not.toBe(postClasses[0]);
    expect(css.match(/color:red;/g)).toHaveLength(2);
    expect(css).toContain(`.state .${preClasses[0]} {color:red;}`);
    expect(css).toContain(`.${postClasses[0]} .state {color:red;}`);
  });

  it('preserves the split between nested preconditions and postconditions', () => {
    const sheet = createSheet('ruleKeyConditionBoundary', null);
    const styles = sheet.create({
      '.outer': {
        box: {
          '.inner': { color: 'red' },
        },
      },
      box: {
        '.outer': {
          '.inner': { color: 'red' },
        },
      },
    });

    const classes = classNames(styles.box);
    const css = sheet.getStyle();

    expect(classes).toHaveLength(2);
    expect(css.match(/color:red;/g)).toHaveLength(2);
    expect(
      classes.some((className) =>
        css.includes(`.outer .${className} .inner {color:red;}`),
      ),
    ).toBe(true);
    expect(
      classes.some((className) =>
        css.includes(`.${className} .outer .inner {color:red;}`),
      ),
    ).toBe(true);
  });
});
