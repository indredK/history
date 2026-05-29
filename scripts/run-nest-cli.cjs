#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');

const repoRoot = path.resolve(__dirname, '..');
const backendDir = path.join(repoRoot, 'backend');
const cliDirLink = path.join(backendDir, 'node_modules', '@nestjs', 'cli');

function loadNestCli() {
  if (!fs.existsSync(cliDirLink)) {
    throw new Error(
      'Missing backend/node_modules/@nestjs/cli. Run `bun install` from the repository root.',
    );
  }

  const cliDir = fs.realpathSync(cliDirLink);
  const cliPackage = require(path.join(cliDir, 'package.json'));
  const commander = require(
    require.resolve('commander', {
      paths: [cliDir],
    }),
  );
  const { CommandLoader } = require(path.join(cliDir, 'commands'));

  return {
    CommandLoader,
    commander,
    version: cliPackage.version,
  };
}

async function main() {
  process.chdir(backendDir);

  try {
    const { CommandLoader, commander, version } = loadNestCli();
    const program = new commander.Command();

    program.name('nest').version(version, '-v, --version', 'Output the current version.');

    await CommandLoader.load(program);
    program.parse(process.argv);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    console.error('Failed to start the Nest CLI runtime.');
    console.error(message);
    console.error('Try a clean reinstall: `rm -rf node_modules frontend/node_modules backend/node_modules && bun install`');
    process.exit(1);
  }
}

main();
