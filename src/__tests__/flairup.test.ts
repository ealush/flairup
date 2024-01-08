import { createSheet } from '../index.js';
import { describe, expect, it, beforeEach } from 'vitest';

const singlePropertyRegex = /^\.([\w-]+)\s*\{\s*([\w-]+)\s*:\s*([\w-]+);\s*\}$/;
const singlePropertyWithPseudoRegex =
  /^\.([\w-]+):([\w-]+)\s*{\s*([\w-]+)\s*:\s*([^;]+);\s*}$/;
const multiPropertyRegex = /^\.(\w+)\s*\{(\s*\w+\s*:\s*\w+;\s*){2,}\}$/;

describe('createSheet', () => {
  let sheet: ReturnType<typeof createSheet>;

  beforeEach(() => {
    sheet = createSheet('test');
  });

  it('should create a sheet', () => {
    const sheet = createSheet('test');
    expect(sheet).toBeDefined();
  });

  it('Should create scoped styles', () => {
    const styles = sheet.create({
      one: {
        color: 'red',
        height: '100px',
      },
      two: {
        color: 'blue',
        height: '200px',
      },
    });

    expect(styles).toHaveProperty('one');
    expect(styles).toHaveProperty('two');
    expect(styles).not.toHaveProperty('three');
  });

  it('Should create one class per property', () => {
    const styles = sheet.create({
      one: {
        color: 'red',
        height: '100px',
      },
      two: {
        color: 'blue',
        height: '200px',
      },
    });

    expect(styles.one.size).toBe(2);
    expect(styles.two.size).toBe(2);
  });

  it('Should create one css rule per property', () => {
    sheet.create({
      one: {
        color: 'red',
        height: '100px',
      },
      two: {
        color: 'blue',
        height: '200px',
      },
    });

    const style = sheet.getStyle();
    expect(style).toMatchInlineSnapshot(`
      ".test_wqxq0q {color:red;}
      .test_kfaw12 {height:100px;}
      .test_kr6kup {color:blue;}
      .test_kfuomf {height:200px;}"
    `);
    expect(style.split('}').filter(Boolean).length).toBe(4);

    const styles = style.split('\n').filter(Boolean);
    expect(styles.length).toBe(4);

    styles.forEach((style) => {
      expect(style).toMatch(singlePropertyRegex);
    });
  });

  describe('When rules repeat across scopes', () => {
    it('Should add to the sheet only once', () => {
      const styles = sheet.create({
        one: {
          color: 'blue',
          height: '100px',
        },
        two: {
          color: 'blue',
          height: '200px',
        },
      });

      expect(styles.one.size).toBe(2);
      expect(styles.two.size).toBe(2);

      const style = sheet.getStyle();
      expect(style).toMatchInlineSnapshot(`
        ".test_kr6kup {color:blue;}
        .test_kfaw12 {height:100px;}
        .test_kfuomf {height:200px;}"
      `);

      const splitStyles = style.split('\n').filter(Boolean);
      expect(splitStyles.length).toBe(3);

      splitStyles.forEach((style) => {
        expect(style).toMatch(singlePropertyRegex);
      });

      describe('When across style objects', () => {
        it('Should add to the sheet only once', () => {
          const styles1 = sheet.create({
            one: {
              color: 'blue',
              height: '100px',
            },
          });

          const styles2 = sheet.create({
            one: {
              color: 'blue',
              height: '100px',
            },
          });

          expect(styles1).toEqual(styles2);

          const splitStyles = sheet.getStyle().split('\n').filter(Boolean);

          splitStyles.forEach((style) => {
            expect(style).toMatch(singlePropertyRegex);
          });
        });
      });
    });
  });

  describe('CSS Variables Support', () => {
    it('Should create css variables under one class', () => {
      const styles = sheet.create({
        one: {
          '--': {
            '--base': 'red',
            '--size': '100px',
          },
        },
      });

      expect(styles.one.size).toBe(1);
      const css = sheet.getStyle();
      expect(css).toMatchInlineSnapshot(
        `".test_2d0m {--base: red; --size: 100px;}"`,
      );

      // list all the individual rules inside of a class
      expect(css).toMatch('--base: red; --size: 100px;');
      expect(css).toMatch('.test_2d0m {');
    });

    describe('When inside of a media query', () => {
      describe('Media query', () => {
        it('Should create css variables under one class', () => {
          const styles = sheet.create({
            one: {
              '@media (max-width: 600px)': {
                '--': {
                  '--base': 'red',
                  '--size': '10px',
                  '--height': '200px',
                },
              },
            },
          });

          expect(styles.one.size).toBe(1);
          const css = sheet.getStyle();
          expect(css).toMatchInlineSnapshot(`
            "@media (max-width: 600px) {
            .test_2d0m {--base: red; --size: 10px; --height: 200px;}
            }"
          `);
          const splitStyles = css.split('\n').filter(Boolean);
          expect(splitStyles.length).toBe(3);
          const [mediaDecleration, vars] = splitStyles;

          expect(mediaDecleration).toBe('@media (max-width: 600px) {');
          expect(vars).toContain('--base: red; --size: 10px; --height: 200px;');
        });
      });
    });
  });

  describe('When using media queries', () => {
    it('Should create media queries', () => {
      const styles = sheet.create({
        one: {
          color: 'red',
          height: '100px',
          '@media (max-width: 600px)': {
            color: 'blue',
            height: '200px',
          },
        },
      });

      expect(styles.one.size).toBe(4);

      const style = sheet.getStyle();
      expect(style).toMatchInlineSnapshot(`
        ".test_wqxq0q {color:red;}
        .test_kfaw12 {height:100px;}
        @media (max-width: 600px) {
        .test_kr6kup {color:blue;}
        .test_kfuomf {height:200px;}
        }"
      `);
      const splitStyles = style.split('\n').filter(Boolean);

      const [
        first,
        second,
        mediaDecleration,
        mediaColor,
        mediaHeight,
        mediaCloser,
      ] = splitStyles;

      expect(first).toMatch(singlePropertyRegex);
      expect(second).toMatch(singlePropertyRegex);
      expect(mediaDecleration).toBe('@media (max-width: 600px) {');
      expect(mediaColor).toMatch(singlePropertyRegex);
      expect(mediaHeight).toMatch(singlePropertyRegex);
      expect(mediaCloser).toBe('}');
    });
  });

  describe('When using pseudo selectors', () => {
    it('Should create pseudo selectors', () => {
      const styles = sheet.create({
        one: {
          color: 'red',
          height: '100px',
          ':hover': {
            color: 'blue',
            height: '200px',
          },
        },
      });

      expect(styles.one.size).toBe(4);

      const style = sheet.getStyle();
      expect(style).toMatchInlineSnapshot(`
        ".test_wqxq0q {color:red;}
        .test_kfaw12 {height:100px;}
        .test_kr6kup:hover {color:blue;}
        .test_kfuomf:hover {height:200px;}"
      `);
      const splitStyles = style.split('\n').filter(Boolean);

      expect(splitStyles[0]).toMatch(singlePropertyRegex);
      expect(splitStyles[1]).toMatch(singlePropertyRegex);
      expect(splitStyles[2]).toMatch(singlePropertyWithPseudoRegex);
      expect(splitStyles[3]).toMatch(singlePropertyWithPseudoRegex);
    });
  });

  describe('Adding a top level class', () => {
    it('Should nest styles under the top level class', () => {
      const styles = sheet.create({
        '.top-level-class': {
          button: {
            color: 'red',
            height: '100px',
          },
        },
      });

      expect(styles).toHaveProperty('button');

      const style = sheet.getStyle();
      expect(style).toMatchInlineSnapshot(`
        ".top-level-class .test_-usj3r7 {color:red;}
        .top-level-class .test_-9fdl2n {height:100px;}"
      `);
      const splitStyles = style.split('\n').filter(Boolean);

      expect(splitStyles.length).toBe(2);
      splitStyles.forEach((style) => {
        expect(style.startsWith('.top-level-class ')).toBe(true);
        const [, value] = style.split('.top-level-class ');
        expect(value).toMatch(singlePropertyRegex);
      });
    });

    describe('When the same style is added outside of the top level', () => {
      it('Should be added separately', () => {
        const styles = sheet.create({
          '.top-level-class': {
            button: {
              color: 'red',
            },
          },
          button: {
            color: 'red',
          },
        });

        expect(styles).toHaveProperty('button');

        const style = sheet.getStyle();
        expect(style).toMatchInlineSnapshot(`
          ".top-level-class .test_-usj3r7 {color:red;}
          .test_wqxq0q {color:red;}"
        `);
        const splitStyles = style.split('\n').filter(Boolean);

        expect(splitStyles[0]?.startsWith('.top-level-class ')).toBe(true);
        expect(splitStyles[1]?.startsWith('.top-level-class ')).toBe(false);

        expect(splitStyles[0]?.split('{')[1]?.trim()).toBe(
          splitStyles[1]?.split('{')[1]?.trim(),
        );

        expect(splitStyles.length).toBe(2);
        expect(styles.button.size).toBe(2);
      });
    });

    describe('When netsed under different top level classes', () => {
      it('Should be added separately', () => {
        const styles = sheet.create({
          '.top-level-class': {
            button: {
              color: 'red',
            },
          },
          '.top-level-class2': {
            button: {
              color: 'red',
            },
          },
        });

        expect(styles).toHaveProperty('button');

        const style = sheet.getStyle();
        expect(style).toMatchInlineSnapshot(`
          ".top-level-class .test_-usj3r7 {color:red;}
          .top-level-class2 .test_-v5zip7 {color:red;}"
        `);
        const splitStyles = style.split('\n').filter(Boolean);

        expect(splitStyles[0]?.startsWith('.top-level-class ')).toBe(true);
        expect(splitStyles[1]?.startsWith('.top-level-class2 ')).toBe(true);

        expect(splitStyles[0]?.split('{')[1]?.trim()).toBe(
          splitStyles[1]?.split('{')[1]?.trim(),
        );

        expect(splitStyles.length).toBe(2);
        expect(styles.button.size).toBe(2);
      });
    });

    describe('When nesting css variables', () => {
      it('Should create css variables under the top level class and the scoped', () => {
        sheet.create({
          '.top-level-class': {
            main: {
              '--': {
                '--base': 'red',
                '--size': '100px',
              },
              color: 'var(--base)',
            },
          },
        });

        expect(sheet.getStyle()).toMatchInlineSnapshot(`
          ".top-level-class .test_1zo3d {--base: red; --size: 100px;}
          .top-level-class .test_9dpf7b {color:var(--base);}"
        `);

        const splitStyles = sheet.getStyle().split('\n').filter(Boolean);
        expect(splitStyles.length).toBe(2);
        expect(splitStyles[0]?.startsWith('.top-level-class ')).toBe(true);
        expect(splitStyles[1]?.startsWith('.top-level-class ')).toBe(true);
      });
    });

    describe("When nesting pseudo selectors under the top level class's selector", () => {
      it('Should create pseudo selectors under the top level class', () => {
        sheet.create({
          '.top-level-class': {
            button: {
              ':hover': {
                color: 'blue',
                height: '200px',
              },
            },
          },
        });

        expect(sheet.getStyle()).toMatchInlineSnapshot(`
          ".top-level-class .test_9l08cm:hover {color:blue;}
          .top-level-class .test_-g6s3v4:hover {height:200px;}"
        `);

        const splitStyles = sheet.getStyle().split('\n').filter(Boolean);
        expect(splitStyles.length).toBe(2);
        expect(splitStyles[0]?.startsWith('.top-level-class ')).toBe(true);
        // eslint-disable-next-line no-unsafe-optional-chaining
        const [topLevel, pseudoDecleration] = splitStyles[0]?.split(' ');
        expect(topLevel).toBe('.top-level-class');
        expect(pseudoDecleration).toBe('.test_9l08cm:hover');
      });
    });
  });
});
