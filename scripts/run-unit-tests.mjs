import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const ROOT = process.cwd();
const TEST_DIR = join(ROOT, 'tests', 'unit', 'lib');
const VITEST_BIN = join(ROOT, 'node_modules', 'vitest', 'vitest.mjs');

const files = readdirSync(TEST_DIR)
  .filter((name) => name.endsWith('.test.ts'))
  .sort();

if (files.length === 0) {
  console.error('No unit test files found in tests/unit/lib.');
  process.exit(1);
}

for (const file of files) {
  const fullPath = join(TEST_DIR, file);
  console.log(`\n[unit] ${file}`);
  const result = spawnSync(
    process.execPath,
    [
      VITEST_BIN,
      'run',
      fullPath,
      '--pool=threads',
      '--poolOptions.threads.minThreads=1',
      '--poolOptions.threads.maxThreads=1',
      '--reporter=dot',
    ],
    { stdio: 'inherit', cwd: ROOT },
  );

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

console.log('\nAll unit test files passed.');
