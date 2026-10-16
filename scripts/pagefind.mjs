import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';

// Index whichever output the build produced: the Vercel adapter's static directory or plain dist.
const site = existsSync('.vercel/output/static') ? '.vercel/output/static' : 'dist';
const result = spawnSync('npx', ['pagefind', '--site', site], {
  stdio: 'inherit',
  shell: process.platform === 'win32',
});
process.exit(result.status ?? 1);
