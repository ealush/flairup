import { createSheet } from '../index.js';
import { describe, expect, it, beforeEach } from 'vitest';

const singlePropertyRegex = /^\.([\w-]+)\s*\{\s*([\w-]+)\s*:\s*([\w-]+);\s*\}$/;
const singlePropertyWithPseudoRegex =
  /^\.([\w-]+):([\w-]+)\s*{\s*([\w-]+)\s*:\s*([^;]+);\s*}$/;

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

  it("Should convert camelCase to dash-case for the property's name", () => {
    const styles = sheet.create({
      one: {
        backgroundColor: 'red',
        maxHeight: '100px',
      },
      two: {
        backgroundColor: 'blue',
        maxHeight: '200px',
      },
    });

    expect(styles.one.size).toBe(2);
    expect(styles.two.size).toBe(2);

    const css = sheet.getStyle();
    expect(css).toMatchInlineSnapshot(`
      ".test_-maqphw {background-color:red;}
      .test_-2526za {max-height:100px;}
      .test_j1uj8f {background-color:blue;}
      .test_-24iedx {max-height:200px;}"
    `);
    const splitStyles = css.split('\n').filter(Boolean);
    expect(splitStyles[0]).toMatch('background-color:red;');
    expect(splitStyles[1]).toMatch('max-height:100px;');
    expect(splitStyles[2]).toMatch('background-color:blue;');
    expect(splitStyles[3]).toMatch('max-height:200px;');
  });

  it('Should stringify content property', () => {
    const styles = sheet.create({
      one: {
        content: 'red',
      },
    });

    expect(styles.one.size).toBe(1);

    const css = sheet.getStyle();
    expect(css).toMatchInlineSnapshot(`".test_-6g56uo {content:"red";}"`);
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
        `".test_217ka {--base:red; --size:100px;}"`,
      );

      // list all the individual rules inside of a class
      expect(css).toMatch('--base:red; --size:100px;');
      expect(css).toMatch(/\.\s*test_[0-9a-zA-Z]+\s*\{/);
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
            .test_217ka {--base:red; --size:10px; --height:200px;}
            }"
          `);
          const splitStyles = css.split('\n').filter(Boolean);
          expect(splitStyles.length).toBe(3);
          const [mediaDecleration, vars] = splitStyles;

          expect(mediaDecleration).toBe('@media (max-width: 600px) {');
          expect(vars).toContain('--base:red; --size:10px; --height:200px;');
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

      expect(styles.one.size).toBe(3);

      const style = sheet.getStyle();
      expect(style).toMatchInlineSnapshot(`
        ".test_wqxq0q {color:red;}
        .test_kfaw12 {height:100px;}
        .test_z7yakv:hover {color:blue;}
        .test_z7yakv:hover {height:200px;}"
      `);
      const splitStyles = style.split('\n').filter(Boolean);

      expect(splitStyles[0]).toMatch(singlePropertyRegex);
      expect(splitStyles[1]).toMatch(singlePropertyRegex);
      expect(splitStyles[2]).toMatch(singlePropertyWithPseudoRegex);
      expect(splitStyles[3]).toMatch(singlePropertyWithPseudoRegex);
    });

    it('Should scope pseudo selector separately from regular selectors with the same property:value', () => {
      const styles = sheet.create({
        one: {
          color: 'red',
          ':hover': {
            color: 'red',
          },
        },
      });

      expect(styles.one.size).toBe(2);
      expect(sheet.getStyle()).toMatchInlineSnapshot(`
        ".test_wqxq0q {color:red;}
        .test_z7yakv:hover {color:red;}"
      `);
    });

    it('Should create unique selector per pseudo selector and property:value combo', () => {
      const styles = sheet.create({
        one: {
          color: 'red',
          ':hover': {
            color: 'red',
          },
          ':focus': {
            color: 'red',
          },
        },
        two: {
          color: 'red',
          ':hover': {
            color: 'red',
          },
          ':focus': {
            color: 'red',
          },
        },
      });

      expect(styles.one.size).toBe(2);
      expect(styles.one).not.toEqual(styles.two);
      expect(sheet.getStyle()).toMatchInlineSnapshot(`
        ".test_wqxq0q {color:red;}
        .test_z7yakv:hover {color:red;}
        .test_z7yakv:focus {color:red;}
        .test_zajen9:hover {color:red;}
        .test_zajen9:focus {color:red;}"
      `);
      const splitStyles = sheet.getStyle().split('\n').filter(Boolean);
      expect(splitStyles[0]).toMatch(singlePropertyRegex);
      expect(splitStyles[1]).toMatch(singlePropertyWithPseudoRegex);
      expect(splitStyles[2]).toMatch(singlePropertyWithPseudoRegex);
    });
  });

  describe('Preconditions', () => {
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
        ".top-level-class .test_3zp0se {color:red;}
        .top-level-class .test_3zp0se {height:100px;}"
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
          ".top-level-class .test_3zp0se {color:red;}
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
          ".top-level-class .test_3zp0se {color:red;}
          .top-level-class2 .test_3zp0se {color:red;}"
        `);
        const splitStyles = style.split('\n').filter(Boolean);

        expect(splitStyles[0]?.startsWith('.top-level-class ')).toBe(true);
        expect(splitStyles[1]?.startsWith('.top-level-class2 ')).toBe(true);

        expect(splitStyles[0]?.split('{')[1]?.trim()).toBe(
          splitStyles[1]?.split('{')[1]?.trim(),
        );

        expect(splitStyles.length).toBe(2);
        expect(styles.button.size).toBe(1);
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
          ".top-level-class .test_1ppqxj {--base:red; --size:100px;}
          .top-level-class .test_1ppqxj {color:var(--base);}"
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
          ".top-level-class .test_5fpxm2:hover {color:blue;}
          .top-level-class .test_5fpxm2:hover {height:200px;}"
        `);

        const splitStyles = sheet.getStyle().split('\n').filter(Boolean);
        expect(splitStyles.length).toBe(2);
        expect(splitStyles[0]?.startsWith('.top-level-class ')).toBe(true);
        // eslint-disable-next-line no-unsafe-optional-chaining
        const [topLevel, pseudoDecleration] = splitStyles[0]?.split(' ');
        expect(topLevel).toBe('.top-level-class');
        expect(pseudoDecleration).toMatch(/^\.test_[\w-]+:hover$/);
      });
    });

    describe('Multiple scopes under the same precondition', () => {
      it('Should create separate classes', () => {
        const styles = sheet.create({
          '.top-level-class': {
            button: {
              color: 'red',
            },
            button2: {
              color: 'blue',
            },
          },
        });

        expect(styles).toHaveProperty('button');
        expect(styles).toHaveProperty('button2');

        const style = sheet.getStyle();
        expect(style).toMatchInlineSnapshot(
          `
          ".top-level-class .test_3zp0se {color:red;}
          .top-level-class .test_-iboff4 {color:blue;}"
        `,
        );
        const splitStyles = style.split('\n').filter(Boolean);

        expect(splitStyles[0]?.startsWith('.top-level-class ')).toBe(true);
        expect(splitStyles[1]?.startsWith('.top-level-class ')).toBe(true);

        expect(splitStyles[0]).toMatch('color:red;');
        expect(splitStyles[1]).toMatch('color:blue;');
        expect(splitStyles[0]).not.toBe(splitStyles[1]);
      });
    });

    describe('With media query', () => {
      it('Should nest precondition style under media query', () => {
        const styles = sheet.create({
          '.top-level-class': {
            button: {
              '@media (max-width: 600px)': {
                color: 'red',
              },
            },
          },
        });

        expect(styles).toHaveProperty('button');

        const style = sheet.getStyle();
        expect(style).toMatchInlineSnapshot(`
          "@media (max-width: 600px) {
          .top-level-class .test_3zp0se {color:red;}
          }"
        `);
        const splitStyles = style.split('\n').filter(Boolean);

        expect(splitStyles[0]?.startsWith('@media (max-width: 600px) {')).toBe(
          true,
        );
        expect(splitStyles[1]?.startsWith('.top-level-class ')).toBe(true);

        expect(splitStyles[1]).toMatch('color:red;');
      });
    });
  });

  describe('Postconditions', () => {
    it("Should nest styles under the precondition's selector", () => {
      const styles = sheet.create({
        button: {
          '.lower_level_class': {
            color: 'red',
          },
        },
      });

      expect(styles).toHaveProperty('button');

      const style = sheet.getStyle();
      expect(style).toMatchInlineSnapshot(
        `".test_5fpxm2 .lower_level_class {color:red;}"`,
      );
      expect(style).toMatch('.lower_level_class');
      expect(style).toMatch('color:red;');
    });

    describe('When nesting multiple postconditions', () => {
      it('Should join all postconditions in the same selector with a space between them', () => {
        const styles = sheet.create({
          button: {
            '.class_a': {
              '.class_b': {
                color: 'red',
              },
              color: 'blue',
            },
          },
        });

        expect(styles).toHaveProperty('button');
        const css = sheet.getStyle();
        expect(css).toMatchInlineSnapshot(
          `
          ".test_pcvvk5 .class_a .class_b {color:red;}
          .test_5fpxm2 .class_a {color:blue;}"
        `,
        );
        const lines = css.split('\n').filter(Boolean);
        expect(lines.length).toBe(2);

        expect(lines[0]).toMatch('.class_a .class_b {color:red;}');
        expect(lines[1]).toMatch('.class_a {color:blue;}');
      });
    });

    describe('When mixing preconditions and postconditions', () => {
      it('Should chain all preconditions and postconditions together', () => {
        const styles = sheet.create({
          '.top-level-class': {
            button: {
              '.lower_level_class': {
                color: 'red',
              },
            },
          },
        });

        expect(styles).toHaveProperty('button');
        const css = sheet.getStyle();
        expect(css).toMatchInlineSnapshot(
          `".top-level-class .test_5fpxm2 .lower_level_class {color:red;}"`,
        );
        expect(css.split('\n').filter(Boolean).length).toBe(1);
      });
    });

    describe('With media query', () => {
      it('Should support postcondition with media query', () => {
        const styles = sheet.create({
          button: {
            '@media (max-width: 600px)': {
              '.lower_level_class': {
                color: 'red',
              },
            },
          },
        });

        expect(styles).toHaveProperty('button');
        const css = sheet.getStyle();
        expect(css).toMatchInlineSnapshot(`
          "@media (max-width: 600px) {
          .test_5fpxm2 .lower_level_class {color:red;}
          }"
        `);
        expect(css.split('\n').filter(Boolean).length).toBe(3);
        expect(css).toMatch(' .lower_level_class {color:red;}');
      });
    });

    describe('With CSS Variables', () => {
      it("Should nest styles under the precondition's selector", () => {
        const styles = sheet.create({
          button: {
            '.lower_level_class': {
              '--': {
                '--base': 'red',
                '--size': '100px',
              },
              color: 'var(--base)',
            },
          },
        });

        expect(styles).toHaveProperty('button');

        const style = sheet.getStyle();
        expect(style).toMatchInlineSnapshot(`
          ".test_5fpxm2 {--base:red; --size:100px;}
          .test_5fpxm2 .lower_level_class {color:var(--base);}"
        `);
        expect(style).toMatch('.lower_level_class');
        expect(style).toMatch('color:var(--base);');
      });
    });

    describe('With pseudo selectors', () => {
      it("Should nest styles under the precondition's selector", () => {
        const styles = sheet.create({
          button: {
            '.lower_level_class': {
              ':hover': {
                color: 'red',
              },
            },
          },
        });

        expect(styles).toHaveProperty('button');

        const style = sheet.getStyle();
        expect(style).toMatchInlineSnapshot(
          `".test_pcvvk5 .lower_level_class:hover {color:red;}"`,
        );
        expect(style).toMatch('.lower_level_class:hover');
        expect(style).toMatch('color:red;');
      });
    });

    describe('Alternate selectors (>+~+*)', () => {
      it("Should append to the selector's class with a space", () => {
        const styles = sheet.create({
          button: {
            '> .lower_level_class': {
              color: 'red',
            },
            '+ .lower_level_class': {
              color: 'red',
            },
            '~ .lower_level_class': {
              color: 'red',
            },
            '* .lower_level_class': {
              color: 'red',
            },
            '::placeholder': {
              color: 'red',
            },
            '*': {
              color: 'red',
            },
          },
        });

        expect(styles).toHaveProperty('button');
        const css = sheet.getStyle();
        expect(css).toMatchInlineSnapshot(`
          ".test_5fpxm2 > .lower_level_class {color:red;}
          .test_5fpxm2 + .lower_level_class {color:red;}
          .test_5fpxm2 ~ .lower_level_class {color:red;}
          .test_5fpxm2 * .lower_level_class {color:red;}
          .test_5fpxm2::placeholder {color:red;}
          .test_5fpxm2 * {color:red;}"
        `);
      });
    });

    describe('& postconditions (&.class, &:pseudo)', () => {
      it("Should be appended to the selector's class without a space", () => {
        const styles = sheet.create({
          button: {
            '&.lower_level_class': {
              color: 'red',
            },
            '&:hover': {
              color: 'red',
            },
          },
        });

        expect(styles).toHaveProperty('button');
        const css = sheet.getStyle();
        expect(css).toMatchInlineSnapshot(`
          ".test_5fpxm2.lower_level_class {color:red;}
          .test_5fpxm2:hover {color:red;}"
        `);
      });
    });
  });

  describe('Multiple preconditions', () => {
    it("Should prepend all peconditions to the scope's class", () => {
      const styles = sheet.create({
        '.top-level-class': {
          '.lower_level_class': {
            button: {
              color: 'red',
            },
          },
        },
      });

      expect(styles).toHaveProperty('button');
      expect(styles.button.size).toBe(1);
      const css = sheet.getStyle();
      expect(css).toMatchInlineSnapshot(
        `".top-level-class .lower_level_class .test_3zp0se {color:red;}"`,
      );
      expect(css.startsWith('.top-level-class .lower_level_class')).toBe(true);
    });

    describe("Multi layer nesting of the same selector's class", () => {
      it('Should deduplicate the selector', () => {
        const styles = sheet.create({
          '.top-level-class': {
            button: { color: 'yellow' },
            '.mid_level_class': {
              button: { color: 'blue' },
              '.lower_level_class': {
                button: {
                  color: 'red',
                },
              },
            },
          },
        });

        expect(styles).toHaveProperty('button');
        const css = sheet.getStyle();
        expect(css).toMatchInlineSnapshot(
          `
          ".top-level-class .test_3zp0se {color:yellow;}
          .top-level-class .mid_level_class .test_3zp0se {color:blue;}
          .top-level-class .mid_level_class .lower_level_class .test_3zp0se {color:red;}"
        `,
        );
        expect(styles.button.size).toBe(1);

        styles.button.forEach((className) => {
          expect(css).toMatch(className);
        });
        const splitStyles = css.split('\n').filter(Boolean);
        expect(splitStyles.filter(Boolean).length).toBe(3);
        expect(splitStyles[0]).toMatch(/^\.top-level-class \.test_[\w-]+ {/);
        expect(splitStyles[1]).toMatch(
          /^\.top-level-class \.mid_level_class \.test_[\w-]+ {/,
        );
        expect(splitStyles[2]).toMatch(
          /^\.top-level-class \.mid_level_class \.lower_level_class \.test_[\w-]+ {/,
        );
      });

      describe('Multiple scopes and multiple preconditions', () => {
        it('Should all all styles under the correct nesting level', () => {
          const styles = sheet.create({
            '.top-level-class': {
              button: { color: 'yellow' },
              '.mid_level_class': {
                paragraph: { color: 'blue' },
                '.lower_level_class': {
                  button: {
                    color: 'red',
                  },
                },
              },
            },
          });
          expect(styles).toHaveProperty('button');
          expect(styles).toHaveProperty('paragraph');
          const css = sheet.getStyle();
          expect(css).toMatchInlineSnapshot(`
            ".top-level-class .test_3zp0se {color:yellow;}
            .top-level-class .mid_level_class .test_4xnzia {color:blue;}
            .top-level-class .mid_level_class .lower_level_class .test_3zp0se {color:red;}"
          `);
          styles.button.forEach((className) => {
            expect(css).toMatch(className);
          });
          const splitStyles = css.split('\n').filter(Boolean);
          styles.paragraph.forEach((className) => {
            expect(splitStyles[0]).not.toMatch(className);
            expect(splitStyles[2]).not.toMatch(className);
            expect(splitStyles[1]).toMatch(className);
          });
          expect(splitStyles.filter(Boolean).length).toBe(3);
          expect(splitStyles[0]).toMatch(/^\.top-level-class \.test_[\w-]+ {/);
          expect(splitStyles[1]).toMatch(
            /^\.top-level-class \.mid_level_class \.test_[\w-]+ {/,
          );
          expect(splitStyles[2]).toMatch(
            /^\.top-level-class \.mid_level_class \.lower_level_class \.test_[\w-]+ {/,
          );
          expect(styles.paragraph.size).toBe(1);
          expect(styles.button.size).toBe(1);
        });
      });

      describe('Multiple predonditions with postconditions', () => {
        it('Should correctly nest all styles', () => {
          const styles = sheet.create({
            '.top-level-class': {
              '.mid_level_class': {
                button: {
                  '.lower_level_class': {
                    color: 'red',
                  },
                },
              },
            },
          });

          expect(styles.button.size).toBe(1);
          expect(styles).toHaveProperty('button');
          const css = sheet.getStyle();
          expect(css).toMatchInlineSnapshot(
            `".top-level-class .mid_level_class .test_5fpxm2 .lower_level_class {color:red;}"`,
          );
          expect(css).toMatch(
            /\.top-level-class \.mid_level_class \.test_[\w-]+ \.lower_level_class {color:red;}/,
          );
          expect(styles.button.size).toBe(1);
        });
      });
    });
  });

  describe('Class deduplication per scope', () => {
    it('Should use the same class name for all pseudoselectors in the same scope', () => {
      const styles = sheet.create({
        button: {
          ':hover': {
            color: 'red',
          },
          ':focus': {
            color: 'blue',
          },
          ':active': {
            color: 'green',
          },
        },
      });

      expect(styles.button.size).toBe(1);
      const css = sheet.getStyle();
      expect(css).toMatchInlineSnapshot(`
        ".test_5fpxm2:hover {color:red;}
        .test_5fpxm2:focus {color:blue;}
        .test_5fpxm2:active {color:green;}"
      `);
      const splitStyles = css.split('\n').filter(Boolean);
      expect(splitStyles.length).toBe(3);
    });

    it('Should use different classnames for different scopes in the same object', () => {
      const styles = sheet.create({
        button1: {
          ':hover': {
            color: 'red',
          },
        },
        button2: {
          ':hover': {
            color: 'red',
          },
        },
        button3: {
          ':hover': {
            color: 'red',
          },
        },
      });

      expect(styles.button1.size).toBe(1);
      expect(styles.button2.size).toBe(1);
      expect(styles.button3.size).toBe(1);
      expect(styles.button1).not.toEqual(styles.button2);
      expect(styles.button1).not.toEqual(styles.button3);
      const css = sheet.getStyle();
      expect(css).toMatchInlineSnapshot(`
        ".test_oj2lbg:hover {color:red;}
        .test_oj2jn6:hover {color:red;}
        .test_oj2j0s:hover {color:red;}"
      `);
      const splitStyles = css.split('\n').filter(Boolean);
      // all lines should be different, but end in :hover {color:red;}
      expect(splitStyles.length).toBe(3);
      expect(splitStyles.length).toBe(new Set(splitStyles).size);
      splitStyles.forEach((style) => {
        expect(style).toMatch(/:hover {color:red;}/);
      });
    });

    it('Should use different class name for pseudo selectors in different scopes of the same name', () => {
      const styles1 = sheet.create({
        button: {
          ':hover': {
            color: 'red',
          },
          ':focus': {
            color: 'blue',
          },
          ':active': {
            color: 'green',
          },
        },
      });
      const styles2 = sheet.create({
        button: {
          ':hover': {
            color: 'red',
          },
          ':focus': {
            color: 'blue',
          },
          ':active': {
            color: 'green',
          },
        },
      });
      expect(styles1.button.size).toBe(1);
      expect(styles2.button.size).toBe(1);
      expect(styles1).not.toEqual(styles2);
      const css = sheet.getStyle();
      expect(css).toMatchInlineSnapshot(`
        ".test_5fpxm2:hover {color:red;}
        .test_5fpxm2:focus {color:blue;}
        .test_5fpxm2:active {color:green;}
        .test_5fpxmy:hover {color:red;}
        .test_5fpxmy:focus {color:blue;}
        .test_5fpxmy:active {color:green;}"
      `);
      const splitStyles = css.split('\n').filter(Boolean);
      expect(splitStyles.length).toBe(6);
      // make sure there are no duplicates
      expect(splitStyles.length).toBe(new Set(splitStyles).size);
    });
  });
});
