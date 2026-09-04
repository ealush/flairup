import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  realpathSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { test } from 'node:test';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const fixtureRoot = mkdtempSync(join(tmpdir(), 'flairup-acceptance-'));
const packRoot = join(fixtureRoot, 'pack');
mkdirSync(packRoot);

const packed = JSON.parse(
  execFileSync(
    'npm',
    ['pack', '--ignore-scripts', '--json', '--pack-destination', packRoot],
    { cwd: projectRoot, encoding: 'utf8' },
  ),
)[0];
const tarball = join(packRoot, packed.filename);
const appRoot = join(fixtureRoot, 'app');

writeFileSync(
  join(fixtureRoot, 'package.json'),
  JSON.stringify({ private: true }),
);
execFileSync(
  'npm',
  [
    'install',
    '--ignore-scripts',
    '--no-audit',
    '--no-fund',
    '--prefix',
    appRoot,
    tarball,
  ],
  { cwd: fixtureRoot, stdio: 'pipe' },
);

test('published tarball contains runtime and declarations but no source/tests', () => {
  const paths = packed.files.map((file) => file.path);
  assert.ok(paths.includes('dist/index.js'));
  assert.ok(paths.includes('dist/esm/index.js'));
  assert.ok(paths.includes('dist/index.d.ts'));
  assert.ok(paths.includes('package.json'));
  assert.equal(
    paths.some((path) => path.startsWith('src/')),
    false,
  );
  assert.equal(
    paths.some((path) => path.includes('__tests__')),
    false,
  );
});

test('CommonJS consumer can require and execute the packed package', () => {
  const requireFromFixture = createRequire(join(appRoot, 'consumer.cjs'));
  const flairup = requireFromFixture('flairup');
  const sheet = flairup.createSheet('packedCjs', null);
  const styles = sheet.create({ box: { color: 'red' } });

  assert.equal(typeof flairup.cx, 'function');
  assert.equal(styles.box.size, 1);
  assert.match(sheet.getStyle(), /color:red/);
});

test('packed package preserves colliding precondition and postcondition identities', () => {
  const requireFromFixture = createRequire(join(appRoot, 'condition.cjs'));
  const { createSheet } = requireFromFixture('flairup');
  const sheet = createSheet('ruleKeyHashCollision', null);
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

  const preClasses = Array.from(styles[preScope]);
  const postClasses = Array.from(styles[postScope]);
  const css = sheet.getStyle();

  assert.equal(preClasses.length, 1);
  assert.equal(postClasses.length, 1);
  assert.notEqual(preClasses[0], postClasses[0]);
  assert.equal((css.match(/color:red;/g) ?? []).length, 2);
  assert.ok(css.includes(`.state .${preClasses[0]} {color:red;}`));
  assert.ok(css.includes(`.${postClasses[0]} .state {color:red;}`));
});

test('ES module consumer can import and execute the packed package', () => {
  const script = [
    "import { createSheet, cx } from 'flairup';",
    "const sheet = createSheet('packedEsm', null);",
    "const styles = sheet.create({ box: { color: 'red' } });",
    "if (!cx(styles.box) || !sheet.getStyle().includes('color:red')) process.exit(1);",
  ].join('\n');

  execFileSync('node', ['--input-type=module', '--eval', script], {
    cwd: appRoot,
    stdio: 'pipe',
  });
});

test('TypeScript consumer accepts the public API exposed by the tarball', () => {
  writeFileSync(
    join(appRoot, 'consumer.ts'),
    [
      "import { createSheet, cx, type CreateSheetOptions } from 'flairup';",
      "const options: CreateSheetOptions = { rootNode: null, nonce: 'nonce' };",
      "const sheet = createSheet('typed', options);",
      "const styles = sheet.create({ box: { color: 'red', ':hover': { color: 'blue' } } });",
      'const className: string = cx(styles.box);',
      'void className;',
    ].join('\n'),
  );
  writeFileSync(
    join(appRoot, 'tsconfig.json'),
    JSON.stringify({
      compilerOptions: {
        lib: ['DOM', 'ES2020'],
        module: 'NodeNext',
        moduleResolution: 'NodeNext',
        noEmit: true,
        strict: true,
        target: 'ES2020',
      },
      include: ['consumer.ts'],
    }),
  );

  const tsc = join(projectRoot, 'node_modules', 'typescript', 'bin', 'tsc');
  execFileSync(process.execPath, [tsc, '--project', 'tsconfig.json'], {
    cwd: appRoot,
    stdio: 'pipe',
  });
});

test('Vite consumer bundles the packed package', () => {
  writeFileSync(
    join(appRoot, 'index.html'),
    '<main id="app"></main><script type="module" src="/main.js"></script>',
  );
  writeFileSync(
    join(appRoot, 'main.js'),
    [
      "import { createSheet, cx } from 'flairup';",
      "const sheet = createSheet('packedVite');",
      "const styles = sheet.create({ app: { color: 'red' } });",
      "document.querySelector('#app').className = cx(styles.app);",
    ].join('\n'),
  );

  const vite = join(projectRoot, 'node_modules', 'vite', 'bin', 'vite.js');
  // Resolve symlinked TMPDIRs (macOS /tmp) so vite's root and cwd agree.
  const realAppRoot = realpathSync(appRoot);
  execFileSync(process.execPath, [vite, 'build', realAppRoot], {
    cwd: realAppRoot,
    stdio: 'pipe',
  });

  const assets = join(appRoot, 'dist', 'assets');
  assert.equal(existsSync(join(appRoot, 'dist', 'index.html')), true);
  assert.equal(
    readdirSync(assets).some((file) => file.endsWith('.js')),
    true,
  );
});

test('package export paths point at files that were actually packed', () => {
  const packageJson = JSON.parse(
    readFileSync(
      join(appRoot, 'node_modules', 'flairup', 'package.json'),
      'utf8',
    ),
  );
  assert.equal(packageJson.exports['.'].require.default, './dist/index.js');
  assert.equal(packageJson.exports['.'].import.default, './dist/esm/index.js');
  assert.equal(packageJson.exports['.'].import.types, './dist/index.d.ts');
});
