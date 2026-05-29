#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');

const repoRoot = path.resolve(__dirname, '..');

const checks = [
  {
    label: 'frontend Vite CLI runtime',
    path: path.join(repoRoot, 'frontend', 'node_modules', 'vite', 'dist', 'node', 'cli.js'),
  },
  {
    label: 'backend Nest CLI command loader',
    path: path.join(
      repoRoot,
      'backend',
      'node_modules',
      '@nestjs',
      'cli',
      'commands',
      'command.loader.js',
    ),
  },
];

const failures = [];

for (const check of checks) {
  if (!fs.existsSync(check.path)) {
    failures.push(`${check.label}: missing ${path.relative(repoRoot, check.path)}`);
  }
}

try {
  const cliDir = fs.realpathSync(
    path.join(repoRoot, 'backend', 'node_modules', '@nestjs', 'cli'),
  );

  require.resolve('commander', {
    paths: [cliDir],
  });
  require.resolve('typescript', {
    paths: [cliDir],
  });
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  failures.push(`backend Nest CLI dependencies: ${message}`);
}

if (failures.length > 0) {
  console.error('Dependency verification failed.');

  for (const failure of failures) {
    console.error(`- ${failure}`);
  }

  console.error('');
  console.error('Recommended fix:');
  console.error('1. Remove the workspace install state: rm -rf node_modules frontend/node_modules backend/node_modules');
  console.error('2. Reinstall once from the repo root: bun install');
  console.error('3. Retry: bun run dev');
  process.exit(1);
}
