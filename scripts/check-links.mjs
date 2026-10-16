import { readdir, readFile, stat } from 'node:fs/promises';
import { join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// Verifies that every internal link and asset reference in the built site resolves to a built file.
const root = fileURLToPath(new URL('../', import.meta.url));
const candidates = ['.vercel/output/static', 'dist'];
let site;
for (const dir of candidates) {
  try {
    if ((await stat(join(root, dir))).isDirectory()) {
      site = join(root, dir);
      break;
    }
  } catch {}
}
if (!site) {
  console.error('No build output found. Run `npm run build` first.');
  process.exit(1);
}

const pages = [];
async function walk(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) await walk(path);
    else if (entry.name.endsWith('.html')) pages.push(path);
  }
}
await walk(site);

async function exists(path) {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

async function resolvesInBuild(url) {
  const clean = decodeURIComponent(url.split('#')[0].split('?')[0]);
  if (!clean || clean === '/') return true;
  const target = resolve(site, `.${clean}`);
  if (!target.startsWith(site)) return false;
  return (await exists(target)) || (await exists(join(target, 'index.html'))) || (await exists(`${target}.html`));
}

const skip = [/^\/keystatic/, /^\/api\//];
const attribute = /\b(?:href|src)=["']([^"']+)["']/g;
const broken = [];
let checked = 0;
for (const page of pages) {
  const html = await readFile(page, 'utf8');
  for (const [, url] of html.matchAll(attribute)) {
    if (!url.startsWith('/') || url.startsWith('//')) continue;
    if (skip.some((pattern) => pattern.test(url))) continue;
    checked++;
    if (!(await resolvesInBuild(url))) broken.push(`${relative(site, page)} -> ${url}`);
  }
}

if (broken.length) {
  console.error(`Link check failed (${broken.length} broken reference${broken.length === 1 ? '' : 's'}):`);
  for (const line of broken) console.error(`- ${line}`);
  process.exit(1);
}
console.log(`Link check passed: ${checked} internal references across ${pages.length} pages.`);
