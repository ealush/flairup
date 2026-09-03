import { createSheet } from '../index.js';
import type { CreateSheetInput } from '../index.js';
import { describe, expect, it, beforeEach, assert, afterEach } from 'vitest';

const singlePropertyRegex = /^\.([\w-]+)\s*\{\s*([\w-]+)\s*:\s*([\w-]+);\s*\}$/;
const singlePropertyWithPseudoRegex =
  /^\.([\w-]+):([\w-]+)\s*{\s*([\w-]+)\s*:\s*([^;]+);\s*}$/;

describe('createSheet', () => {
  let sheet: ReturnType<typeof createSheet>;

  beforeEach(() => {
    sheet = createSheet('test');
  });

  afterEach(() => {
    const styleTags = document.querySelectorAll('style');
    styleTags.forEach((styleTag) => {
      styleTag.remove();
    });
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
      ".test_-63zkkl {background-color:red;}
      .test_cq0h9r {max-height:100px;}
      .test_nnfe34 {background-color:blue;}
      .test_cqk9v4 {max-height:200px;}"
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

  describe('CSS Variables Support', () => {
    it('Should create one atomic class per css variable', () => {
      const styles = sheet.create({
        one: {
          '--': {
            '--base': 'red',
            '--size': '100px',
          },
        },
      });

      expect(styles.one.size).toBe(2);
      const classes = Array.from(styles.one);
      expect(new Set(classes).size).toBe(2);

      const css = sheet.getStyle();
      const declarations = ['--base:red;', '--size:100px;'];
      declarations.forEach((declaration) => {
        const match = classes.find((className) =>
          css.includes(`.${className} {${declaration}}`),
        );
        expect(match).toBeDefined();
      });
      // atomic: no grouped multi-declaration rule
      expect(css).not.toContain('--base:red; --size:100px;');
    });

    describe('When inside of a media query', () => {
      describe('Media query', () => {
        it('Should create one atomic class per css variable', () => {
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

          expect(styles.one.size).toBe(3);
          const classes = Array.from(styles.one);
          expect(new Set(classes).size).toBe(3);

          const css = sheet.getStyle();
          expect(css).toContain('@media (max-width: 600px) {');
          const mediaBlock = css.slice(
            css.indexOf('@media (max-width: 600px)'),
          );
          const declarations = [
            '--base:red;',
            '--size:10px;',
            '--height:200px;',
          ];
          declarations.forEach((declaration) => {
            const match = classes.find((className) =>
              mediaBlock.includes(`.${className} {${declaration}}`),
            );
            expect(match).toBeDefined();
          });
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
        .test_-njo7sh {color:blue;}
        .test_xfo8f9 {height:200px;}
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
      const splitStyles = style.split('\n').filter(Boolean);

      // One atomic class per declaration: the two :hover rules use
      // distinct classes.
      expect(splitStyles).toHaveLength(4);
      expect(splitStyles[0]).toMatch(singlePropertyRegex);
      expect(splitStyles[1]).toMatch(singlePropertyRegex);
      expect(splitStyles[2]).toMatch(singlePropertyWithPseudoRegex);
      expect(splitStyles[3]).toMatch(singlePropertyWithPseudoRegex);
      expect(style).toContain(':hover {color:blue;}');
      expect(style).toContain(':hover {height:200px;}');
      const hoverClasses = splitStyles
        .slice(2)
        .map((line) => line.split(':')[0]);
      expect(new Set(hoverClasses).size).toBe(2);
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
        .test_-jtih2p:hover {color:red;}"
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

      expect(styles.one.size).toBe(3);
      expect(styles.two.size).toBe(3);
      expect(styles.one).not.toEqual(styles.two);

      // The global declaration is shared; each conditional declaration
      // gets its own atomic class.
      const shared = Array.from(styles.one).filter((className) =>
        styles.two.has(className),
      );
      expect(shared).toHaveLength(1);
      for (const className of shared) {
        expect(sheet.getStyle()).toContain(`.${className} {color:red;}`);
      }

      const splitStyles = sheet.getStyle().split('\n').filter(Boolean);
      expect(splitStyles).toHaveLength(5);
      expect(splitStyles[0]).toMatch(singlePropertyRegex);
      splitStyles.slice(1).forEach((line) => {
        expect(line).toMatch(singlePropertyWithPseudoRegex);
      });
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
        ".top-level-class .test_aysr3d {color:red;}
        .top-level-class .test_xy06wt {height:100px;}"
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
          ".top-level-class .test_aysr3d {color:red;}
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
          ".top-level-class .test_aysr3d {color:red;}
          .top-level-class2 .test_-kgu9nn {color:red;}"
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
      it('Should create one atomic class per css variable under the top level class', () => {
        const styles = sheet.create({
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

        expect(styles).toHaveProperty('main');
        expect(styles.main.size).toBe(3);
        const classes = Array.from(styles.main);
        expect(new Set(classes).size).toBe(3);

        const css = sheet.getStyle();
        const declarations = [
          '--base:red;',
          '--size:100px;',
          'color:var(--base);',
        ];
        declarations.forEach((declaration) => {
          const match = classes.find((className) =>
            css.includes(`.top-level-class .${className} {${declaration}}`),
          );
          expect(match).toBeDefined();
        });
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
          ".top-level-class .test_my8e55:hover {color:blue;}
          .top-level-class .test_9b41m7:hover {height:200px;}"
        `);

        const splitStyles = sheet.getStyle().split('\n').filter(Boolean);
        expect(splitStyles.length).toBe(2);
        expect(splitStyles[0]?.startsWith('.top-level-class ')).toBe(true);
        // eslint-disable-next-line no-unsafe-optional-chaining
        const [topLevel, pseudoDecleration] = splitStyles[0]?.split(' ') ?? [];
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
          ".top-level-class .test_aysr3d {color:red;}
          .top-level-class .test_iuzyyf {color:blue;}"
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
          .top-level-class .test_b7kiy1 {color:red;}
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
        `".test_-33zi7a .lower_level_class {color:red;}"`,
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
          ".test_-5wwlwl .class_a .class_b {color:red;}
          .test_4zh20u .class_a {color:blue;}"
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
          `".top-level-class .test_89hes1 .lower_level_class {color:red;}"`,
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
          .test_4qute2 .lower_level_class {color:red;}
          }"
        `);
        expect(css.split('\n').filter(Boolean).length).toBe(3);
        expect(css).toMatch(' .lower_level_class {color:red;}');
      });
    });

    describe('With CSS Variables', () => {
      it('Should create one atomic class per css variable under the postcondition selector', () => {
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
        expect(styles.button.size).toBe(3);
        const classes = Array.from(styles.button);
        expect(new Set(classes).size).toBe(3);

        const style = sheet.getStyle();
        const declarations = [
          '--base:red;',
          '--size:100px;',
          'color:var(--base);',
        ];
        declarations.forEach((declaration) => {
          const match = classes.find((className) =>
            style.includes(`.${className} .lower_level_class {${declaration}}`),
          );
          expect(match).toBeDefined();
        });
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
          `".test_jbgp63 .lower_level_class:hover {color:red;}"`,
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
          ".test_w7twe4 > .lower_level_class {color:red;}
          .test_-5w72tt + .lower_level_class {color:red;}
          .test_-iuof0k ~ .lower_level_class {color:red;}
          .test_-muqxio * .lower_level_class {color:red;}
          .test_-qqmu34::placeholder {color:red;}
          .test_gmcsfb * {color:red;}"
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
          ".test_e0mpv8.lower_level_class {color:red;}
          .test_zdyq3p:hover {color:red;}"
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
        `".top-level-class .lower_level_class .test_701jl4 {color:red;}"`,
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
          ".top-level-class .test_mm4lg8 {color:yellow;}
          .top-level-class .mid_level_class .test_39b1l2 {color:blue;}
          .top-level-class .mid_level_class .lower_level_class .test_-unpgpq {color:red;}"
        `,
        );
        expect(styles.button.size).toBe(3);

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
            ".top-level-class .test_mm4lg8 {color:yellow;}
            .top-level-class .mid_level_class .test_tjeyni {color:blue;}
            .top-level-class .mid_level_class .lower_level_class .test_-unpgpq {color:red;}"
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
          expect(styles.button.size).toBe(2);
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
            `".top-level-class .mid_level_class .test_-te9lit .lower_level_class {color:red;}"`,
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
    it('Should use one class per declaration across pseudoselectors in the same scope', () => {
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

      expect(styles.button.size).toBe(3);
      const classes = Array.from(styles.button);
      expect(new Set(classes).size).toBe(3);

      const css = sheet.getStyle();
      const expectations: Array<[string, string]> = [
        [':hover', 'color:red;'],
        [':focus', 'color:blue;'],
        [':active', 'color:green;'],
      ];
      expectations.forEach(([pseudo, declaration]) => {
        const match = classes.find((className) =>
          css.includes(`.${className}${pseudo} {${declaration}}`),
        );
        expect(match).toBeDefined();
      });
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
        ".test_-p44zf8:hover {color:red;}
        .test_-p52py4:hover {color:red;}
        .test_-p4iwuk:hover {color:red;}"
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
      expect(styles1.button.size).toBe(3);
      expect(styles2.button.size).toBe(3);
      expect(styles1).not.toEqual(styles2);
      const css = sheet.getStyle();
      const splitStyles = css.split('\n').filter(Boolean);
      expect(splitStyles.length).toBe(6);
      // make sure there are no duplicates
      expect(splitStyles.length).toBe(new Set(splitStyles).size);
      expect(css).toContain(':hover {color:red;}');
      expect(css).toContain(':focus {color:blue;}');
      expect(css).toContain(':active {color:green;}');
    });
  });

  describe('Applying the sheet to the dom', () => {
    it("Should add a style element to the dom with the sheet's name as its id", () => {
      expect(document.querySelector('style#flairup-example')).toBeNull();

      createSheet('example');
      expect(
        document.querySelector('style#flairup-example') instanceof
          HTMLStyleElement,
      ).toBe(true);
      expect(
        document.querySelector('style#flairup-test') instanceof
          HTMLStyleElement,
      ).toBe(true);
    });

    it('Should append the content of the sheet to the style element', () => {
      const sheet = createSheet('example');
      const styleTag = document.querySelector('style#flairup-example');
      expect(styleTag).not.toBeNull();
      expect(styleTag?.textContent).toEqual(sheet.getStyle());
      expect(sheet.isApplied()).toBe(true);
    });

    describe('Alternative root node', () => {
      it('Should nest the style tag under the root node', () => {
        const root = document.createElement('div');
        document.body.appendChild(root);
        const sheet = createSheet('example', root);
        const styleTag = document.querySelector('style#flairup-example');
        assert(styleTag instanceof HTMLStyleElement);
        expect(styleTag.parentElement).toBe(root);
        expect(sheet.isApplied()).toBe(true);
      });
    });

    describe('Disable mounting', () => {
      it("Should not mount the sheet's style tag", () => {
        const sheet = createSheet('example', null);
        const styleTag = document.querySelector('style#flairup-example');
        expect(styleTag).toBeNull();
        expect(sheet.isApplied()).toBe(false);
      });
    });
  });

  describe('Keyframes', () => {
    it('Should add prefixed and incremented keyframes names to the sheet', () => {
      sheet.keyframes({
        kf: {
          '0%': {
            color: 'red',
            opacity: '0',
          },
          '100%': {
            color: 'blue',
            opacity: '1',
          },
        },
        leftToRight: {
          from: {
            left: '0',
          },
          to: {
            right: '100%',
          },
        },
      });
      const css = sheet.getStyle();
      expect(css).toMatchInlineSnapshot(`
        "@keyframes test_0_kf {
        0% { color:red; opacity:0; }
        100% { color:blue; opacity:1; }
        }
        @keyframes test_1_leftToRight {
        from { left:0; }
        to { right:100%; }
        }"
      `);
    });
    it('Should prevent name collision across invocations', () => {
      sheet.keyframes({
        kf: {
          '0%': {
            opacity: '0',
          },
          '100%': {
            opacity: '1',
          },
        },
      });
      sheet.keyframes({
        kf: {
          '0%': {
            color: 'red',
          },
          '100%': {
            color: 'blue',
          },
        },
      });
      const css = sheet.getStyle();
      expect(css).toMatchInlineSnapshot(`
        "@keyframes test_0_kf {
        0% { opacity:0; }
        100% { opacity:1; }
        }
        @keyframes test_1_kf {
        0% { color:red; }
        100% { color:blue; }
        }"
      `);
    });
    it('Should output an object with the keyframe names', () => {
      const keyframes = sheet.keyframes({
        kf: {
          '0%': {
            color: 'red',
            opacity: '0',
          },
          '100%': {
            color: 'blue',
            opacity: '1',
          },
        },
        leftToRight: {
          from: {
            left: '0',
          },
          to: {
            right: '100%',
          },
        },
      });

      expect(keyframes.kf).toBeDefined();
      expect(keyframes.leftToRight).toBeDefined();
    });

    it('Should return a string matching the hasned names in the sheet', () => {
      const keyframes = sheet.keyframes({
        kf: {
          '0%': {
            color: 'red',
            opacity: '0',
          },
          '100%': {
            color: 'blue',
            opacity: '1',
          },
        },
        leftToRight: {
          from: {
            left: '0',
          },
          to: {
            right: '100%',
          },
        },
      });

      expect(keyframes.kf).toBe('test_0_kf');
      expect(keyframes.leftToRight).toBe('test_1_leftToRight');
    });
  });
});

describe('CSS variables scoping', () => {
  let sheet: ReturnType<typeof createSheet>;

  beforeEach(() => {
    sheet = createSheet('vars');
  });

  afterEach(() => {
    const styleTags = document.querySelectorAll('style');
    styleTags.forEach((styleTag) => {
      styleTag.remove();
    });
  });

  it('scopes variables under postconditions instead of leaking them', () => {
    const styles = sheet.create({
      button: {
        ':hover': {
          '--': {
            '--base': 'red',
          },
        },
      },
    });

    expect(styles.button.size).toBe(1);
    const css = sheet.getStyle();
    expect(css).toContain(':hover');
    expect(css).toMatch(/:hover\s*\{[^}]*--base:red;/);
  });

  it('uses distinct classes for global and media variables', () => {
    const styles = sheet.create({
      one: {
        '--': {
          '--base': 'red',
        },
        '@media (max-width: 600px)': {
          '--': {
            '--base': 'blue',
          },
        },
      },
    });

    expect(styles.one.size).toBe(2);
    const css = sheet.getStyle();
    expect(css).toContain('--base:red;');
    const mediaBlock = css.slice(css.indexOf('@media'));
    expect(mediaBlock).toContain('--base:blue;');
  });

  it('keeps media-only variables working', () => {
    const styles = sheet.create({
      one: {
        '@media (max-width: 600px)': {
          '--': {
            '--base': 'red',
          },
        },
      },
    });

    expect(styles.one.size).toBe(1);
    const css = sheet.getStyle();
    const mediaBlock = css.slice(css.indexOf('@media'));
    expect(mediaBlock).toContain('--base:red;');
  });

  it('emits variables directly under a precondition instead of dropping them', () => {
    sheet.create({
      '.top': {
        '--': {
          '--base': 'red',
        },
      },
    });

    expect(sheet.getStyle()).toContain('.top');
    expect(sheet.getStyle()).toContain('--base:red;');
  });
});

describe('Property spelling', () => {
  let sheet: ReturnType<typeof createSheet>;

  beforeEach(() => {
    sheet = createSheet('spelling');
  });

  afterEach(() => {
    const styleTags = document.querySelectorAll('style');
    styleTags.forEach((styleTag) => {
      styleTag.remove();
    });
  });

  it('dedupes camelCase and dash-case spellings of one property', () => {
    const first = sheet.create({
      a: { backgroundColor: 'red' },
    });
    // Dash-case spellings are accepted at runtime (and deduplicated) even
    // though the static types only list camelCase properties.
    const second = sheet.create({
      b: { 'background-color': 'red' },
    } as unknown as CreateSheetInput<'b'>);

    expect(first.a).toEqual(second.b);
    expect(sheet.getStyle().match(/background-color:red;/g)?.length).toBe(1);
  });
});
