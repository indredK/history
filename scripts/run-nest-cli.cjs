#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const repoRoot = path.resolve(__dirname, '..');
const backendDir = path.join(repoRoot, 'backend');
const cliDirLink = path.join(backendDir, 'node_modules', '@nestjs', 'cli');

function main() {
  process.chdir(backendDir);

  try {
    if (!fs.existsSync(cliDirLink)) {
      throw new Error(
        'Missing backend/node_modules/@nestjs/cli. Run `bun install` from the repository root.',
      );
    }

    const cliDir = fs.realpathSync(cliDirLink);
    const cliPackage = require(path.join(cliDir, 'package.json'));
    const cliEntry = path.resolve(cliDir, cliPackage.bin.nest);
    const result = spawnSync(process.execPath, [cliEntry, ...process.argv.slice(2)], {
      cwd: backendDir,
      stdio: 'inherit',
    });

    if (result.error) throw result.error;
    process.exitCode = result.status ?? 1;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    console.error('Failed to start the Nest CLI runtime.');
    console.error(message);
    console.error('Try a clean reinstall: `rm -rf node_modules frontend/node_modules backend/node_modules && bun install`');
    process.exit(1);
  }
}

main();
