#!/usr/bin/env node
import { spawn } from 'node:child_process';

const args = process.argv.slice(2);
let mode = 'api';
if (args.includes('--mock')) mode = 'mock';
if (args.includes('--api')) mode = 'api';

const child = spawn('npm', ['run', 'dev'], {
  stdio: 'inherit',
  env: { ...process.env, VITE_DATA_SOURCE: mode },
});

child.on('exit', (code) => {
  process.exit(code ?? 0);
});

