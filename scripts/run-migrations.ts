#!/usr/bin/env tsx
import { execFileSync } from 'child_process';
import fs from 'fs';
import { createRequire } from 'module';
import path from 'path';

import { compareSemver } from '../skills-engine/state.js';

// The tsx CLI opens an IPC socket. That fails in restricted runtimes even though
// Node is otherwise allowed to execute the migration. Loading tsx through Node's
// --import hook provides the same TypeScript support without an IPC server.
const require = createRequire(import.meta.url);
const tsxLoader = require.resolve('tsx');

const fromVersion = process.argv[2];
const toVersion = process.argv[3];
const newCorePath = process.argv[4];

if (!fromVersion || !toVersion || !newCorePath) {
  console.error(
    'Usage: tsx scripts/run-migrations.ts <from-version> <to-version> <new-core-path>',
  );
  process.exit(1);
}

interface MigrationResult {
  version: string;
  success: boolean;
  error?: string;
}

const results: MigrationResult[] = [];

// Look for migrations in the new core
const migrationsDir = path.join(newCorePath, 'migrations');

if (!fs.existsSync(migrationsDir)) {
  console.log(JSON.stringify({ migrationsRun: 0, results: [] }, null, 2));
  process.exit(0);
}

// Discover migration directories (version-named)
const entries = fs.readdirSync(migrationsDir, { withFileTypes: true });
const migrationVersions = entries
  .filter((e) => e.isDirectory() && /^\d+\.\d+\.\d+$/.test(e.name))
  .map((e) => e.name)
  .filter(
    (v) =>
      compareSemver(v, fromVersion) > 0 && compareSemver(v, toVersion) <= 0,
  )
  .sort(compareSemver);

const projectRoot = process.cwd();

for (const version of migrationVersions) {
  const migrationIndex = path.join(migrationsDir, version, 'index.ts');
  if (!fs.existsSync(migrationIndex)) {
    results.push({
      version,
      success: false,
      error: `Migration ${version}/index.ts not found`,
    });
    continue;
  }

  try {
    execFileSync(
      process.execPath,
      ['--import', tsxLoader, migrationIndex, projectRoot],
      {
        stdio: 'pipe',
        cwd: projectRoot,
        timeout: 120_000,
      },
    );
    results.push({ version, success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    results.push({ version, success: false, error: message });
  }
}

console.log(
  JSON.stringify({ migrationsRun: results.length, results }, null, 2),
);

// Exit with error if any migration failed
if (results.some((r) => !r.success)) {
  process.exit(1);
}
