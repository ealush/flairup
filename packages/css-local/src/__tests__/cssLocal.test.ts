import { describe, expect, it } from 'vitest';
import { createSheet } from '../index.ts';

describe('createSheet', () => {
  it('should create a sheet', () => {
    const sheet = createSheet('test');
    expect(sheet).toBeDefined();
  });
});
