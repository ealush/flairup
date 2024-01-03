import { cx } from '../index.js';
import { describe, expect, it } from 'vitest';

describe('cx', () => {
  it('should return a string', () => {
    expect(typeof cx()).toBe('string');
  });

  it('Should concatenate array arguments', () => {
    expect(cx(['a', 'b'])).toBe('a b');
  });

  it('When taken it object, it should only add truthy keys', () => {
    expect(cx({ a: true, b: false })).toBe('a');
    expect(cx({ yes: 1, no: 0 })).toBe('yes');
    expect(cx({ yes: 1, no: 0, maybe: 1 })).toBe('yes maybe');
  });

  it("Should concatenate sets' values", () => {
    expect(cx(new Set(['a', 'b']))).toBe('a b');
    expect(cx(new Set(['a', 'b']), new Set(['c', 'd']))).toBe('a b c d');
  });

  it('Should concatenate nested arrays', () => {
    expect(cx(['a', ['b', 'c']])).toBe('a b c');
  });

  it("Should concatenate object in nested arrays' values", () => {
    expect(cx(['a', ['b', { c: true }]])).toBe('a b c');
    expect(cx(['a', ['b', { c: false }]])).toBe('a b');
  });

  it('Should allow mixing of types when passing multiple arguments', () => {
    expect(cx('a', ['b', 'c'], { d: true })).toBe('a b c d');
    expect(cx('a', ['b', 'c'], { d: false })).toBe('a b c');
  });
});
