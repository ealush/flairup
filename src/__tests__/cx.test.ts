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

  it('Should return an empty string for nullish arguments', () => {
    expect(cx(null)).toBe('');
    expect(cx(undefined)).toBe('');
  });

  it('Should ignore nullish and falsy non-string arguments', () => {
    expect(cx('a', null, undefined, false, 0)).toBe('a');
  });

  it('Should return an empty string for empty strings', () => {
    expect(cx('')).toBe('');
  });

  it('Should ignore numbers', () => {
    expect(cx(42)).toBe('');
  });

  it('Should collapse exact duplicate custom tokens to one', () => {
    expect(cx('a', 'a')).toBe('a');
  });

  it('Should preserve nested and conditional forms', () => {
    expect(cx(['a', ['b', { c: true, d: false }]])).toBe('a b c');
    expect(cx('a', new Set(['b', 'c']))).toBe('a b c');
  });
});
