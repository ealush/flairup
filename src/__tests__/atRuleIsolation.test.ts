import { createSheet } from '../index.js';
import { afterEach, describe, expect, it } from 'vitest';

const MEDIA = '@media (max-width: 600px)' as const;

afterEach(() => {
  document.querySelectorAll('style').forEach((styleTag) => {
    styleTag.remove();
  });
});

describe('at-rule isolation', () => {
  it('keeps the media rule when the same declaration already exists globally', () => {
    const sheet = createSheet('atGlobalFirst', null);
    const global = sheet.create({
      a: { color: 'red' },
    });
    const media = sheet.create({
      b: { [MEDIA]: { color: 'red' } },
    });

    const mediaClass = Array.from(media.b).join(' ');
    const globalClass = Array.from(global.a).join(' ');
    expect(mediaClass).not.toBe(globalClass);

    const css = sheet.getStyle();
    expect(css).toContain(`${MEDIA} {`);
    const mediaBlock = css.slice(css.indexOf(MEDIA));
    expect(mediaBlock).toContain(`.${mediaClass} {color:red;}`);
    expect(css).toContain(`.${globalClass} {color:red;}`);
  });

  it('keeps the global rule when the same declaration already exists in a media query', () => {
    const sheet = createSheet('atMediaFirst', null);
    const media = sheet.create({
      b: { [MEDIA]: { color: 'red' } },
    });
    const global = sheet.create({
      a: { color: 'red' },
    });

    const mediaClass = Array.from(media.b).join(' ');
    const globalClass = Array.from(global.a).join(' ');
    expect(mediaClass).not.toBe(globalClass);

    const css = sheet.getStyle();
    expect(css).toContain(`${MEDIA} {`);
    expect(css).toContain(`.${globalClass} {color:red;}`);
    expect(css).toContain(`.${mediaClass} {color:red;}`);
  });

  it('does not emit an empty media block when every rule is already on the sheet', () => {
    const sheet = createSheet('atEmpty', null);
    sheet.create({
      a: { [MEDIA]: { color: 'red' } },
    });
    sheet.create({
      b: { [MEDIA]: { color: 'red' } },
    });

    const css = sheet.getStyle();
    expect(css.match(/@media \(max-width: 600px\) \{/g)?.length).toBe(1);
    expect(css).not.toMatch(/@media \(max-width: 600px\) \{\s*\}/);
  });

  it('does not append an empty media block when a repeated rule fully deduplicates', () => {
    const sheet = createSheet('atNoEmptyBlock', null);
    sheet.create({
      a: { [MEDIA]: { color: 'red' } },
    });
    const before = sheet.getStyle();

    sheet.create({
      b: { [MEDIA]: { color: 'red' } },
    });

    expect(sheet.getStyle()).toBe(before);
    expect(sheet.getStyle()).not.toMatch(/@media[^{}]+\{\s*\}/);
  });

  it('keeps only new declarations when a media block partially deduplicates', () => {
    const sheet = createSheet('atPartialDedupe', null);
    sheet.create({
      a: { [MEDIA]: { color: 'red' } },
    });
    sheet.create({
      b: { [MEDIA]: { color: 'red', height: '10px' } },
    });

    expect(sheet.getStyle().match(/color:red/g)).toHaveLength(1);
    expect(sheet.getStyle().match(/height:10px/g)).toHaveLength(1);
  });

  it('shares one media class across scopes for the same query and declaration', () => {
    const sheet = createSheet('atShared', null);
    const first = sheet.create({
      a: { [MEDIA]: { color: 'red' } },
    });
    const second = sheet.create({
      b: { [MEDIA]: { color: 'red' } },
    });

    expect(first.a).toEqual(second.b);

    const css = sheet.getStyle();
    const mediaBlock = css.slice(css.indexOf(MEDIA));
    expect(mediaBlock.match(/color:red/g)?.length).toBe(1);
  });

  it('uses distinct classes for different media queries', () => {
    const sheet = createSheet('atDistinct', null);
    const first = sheet.create({
      a: { '@media (max-width: 600px)': { color: 'red' } },
    });
    const second = sheet.create({
      b: { '@media (min-width: 601px)': { color: 'red' } },
    });

    expect(first.a).not.toEqual(second.b);

    const css = sheet.getStyle();
    expect(css).toContain('@media (max-width: 600px) {');
    expect(css).toContain('@media (min-width: 601px) {');
    expect(css.match(/color:red/g)?.length).toBe(2);
  });

  it('isolates pseudo-selector rules between global and media contexts', () => {
    const sheet = createSheet('atPseudo', null);
    sheet.create({
      a: { ':hover': { color: 'red' } },
    });
    sheet.create({
      b: { [MEDIA]: { ':hover': { color: 'red' } } },
    });

    const css = sheet.getStyle();
    expect(css).toContain(':hover');
    const mediaBlock = css.slice(css.indexOf(MEDIA));
    expect(mediaBlock).toContain(':hover');
    expect(mediaBlock).toContain('color:red');
  });

  it('isolates top-level preconditions between global and media contexts', () => {
    const sheet = createSheet('atPre', null);
    const global = sheet.create({
      '.top': { button: { color: 'red' } },
    });
    const media = sheet.create({
      '.top': { button: { [MEDIA]: { color: 'red' } } },
    });

    expect(media.button).not.toEqual(global.button);

    const css = sheet.getStyle();
    const mediaBlock = css.slice(css.indexOf(MEDIA));
    expect(mediaBlock).toContain('.top');
    expect(mediaBlock).toContain('color:red');
  });
});
