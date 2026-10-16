import { readdir, readFile } from 'node:fs/promises';
import { extname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { site } from '../src/config.ts';

const root = fileURLToPath(new URL('../', import.meta.url));
const ignoredDirectories = new Set(['node_modules', '.git', 'dist', '.astro']);
const ignoredFiles = new Set(['package-lock.json', '.DS_Store']);
const textExtensions = new Set([
  '.md',
  '.mdx',
  '.astro',
  '.ts',
  '.tsx',
  '.js',
  '.jsx',
  '.mjs',
  '.cjs',
  '.json',
  '.css',
  '.html',
  '.xml',
  '.svg',
  '.txt',
  '.yml',
  '.yaml',
  '.toml',
  '.csv',
]);
const textFilenames = new Set(['.gitignore', '.env.example', '.editorconfig', '.npmrc', 'Dockerfile']);
// Detect the scripts used by the previous content and common East Asian punctuation.
// This guard does not claim to identify every language or validate English prose.
const nonEnglishText = /[\u3400-\u9fff\u3000-\u303f\u3040-\u30ff\uac00-\ud7af]/u;
const legacyLocale = /\b(?:z[h][-_](?:CN|TW|HK)|e[n][-_]GB)\b/i;
const issues = [];
let checked = 0;

if (site.locale !== 'en-US' || site.ogLocale !== 'en_US') {
  issues.push('src/config.ts: expected the en-US locale and en_US Open Graph locale');
}

function inspectJson(value, path) {
  if (typeof value === 'string' && nonEnglishText.test(value)) {
    issues.push(`${path}: non-English characters in a JSON string`);
  } else if (Array.isArray(value)) {
    value.forEach((item, index) => inspectJson(item, `${path}[${index}]`));
  } else if (value && typeof value === 'object') {
    for (const [key, item] of Object.entries(value)) {
      if (nonEnglishText.test(key)) issues.push(`${path}: non-English JSON key`);
      inspectJson(item, `${path}.${key}`);
    }
  }
}

async function walk(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (ignoredDirectories.has(entry.name) || ignoredFiles.has(entry.name)) continue;
    if (entry.name === '.env' || (entry.name.startsWith('.env.') && entry.name !== '.env.example')) continue;
    const path = join(directory, entry.name);
    const name = relative(root, path);
    if (nonEnglishText.test(entry.name)) issues.push(`${name}: use an English filename`);
    if (entry.isDirectory()) {
      await walk(path);
    } else if (entry.isFile() && (textExtensions.has(extname(entry.name)) || textFilenames.has(entry.name))) {
      const text = await readFile(path, 'utf8');
      checked++;
      text.split('\n').forEach((line, index) => {
        if (nonEnglishText.test(line)) issues.push(`${name}:${index + 1}: use US English`);
        if (legacyLocale.test(line)) issues.push(`${name}:${index + 1}: use the project locale`);
      });
      if (extname(entry.name) === '.json' && !nonEnglishText.test(text)) {
        try {
          inspectJson(JSON.parse(text), name);
        } catch {
          issues.push(`${name}: invalid JSON; language inspection could not finish`);
        }
      }
    }
  }
}

await walk(root);
if (issues.length) {
  console.error(`US English check failed (${issues.length} issue${issues.length === 1 ? '' : 's'}):`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exitCode = 1;
} else {
  console.log(`US English check passed: ${checked} project text files; en-US / en_US configured.`);
}
