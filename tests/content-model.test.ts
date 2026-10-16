import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import { basename, extname, join } from 'node:path';
import { parse } from 'yaml';
import { articleSchema, noteSchema } from '../src/lib/schema.ts';

const root = new URL('../src/content/', import.meta.url).pathname;

async function entries(folder: string) {
  const files = (await readdir(join(root, folder))).filter((name) => /\.mdx?$/.test(name));
  return Promise.all(
    files.map(async (name) => {
      const text = await readFile(join(root, folder, name), 'utf8');
      const match = text.match(/^---\n([\s\S]*?)\n---\n/);
      assert.ok(match, `${folder}/${name} has frontmatter`);
      return { id: basename(name, extname(name)), data: parse(match![1]) };
    }),
  );
}

test('every article and note on disk satisfies its schema', async () => {
  const [articles, notes] = await Promise.all([entries('articles'), entries('notes')]);
  assert.ok(articles.length > 0 && notes.length > 0, 'both folders have content');
  for (const { id, data } of articles) {
    const parsed = articleSchema().safeParse(data);
    assert.ok(parsed.success, `articles/${id}: ${parsed.success ? '' : JSON.stringify(parsed.error.issues)}`);
  }
  for (const { id, data } of notes) {
    const parsed = noteSchema.safeParse(data);
    assert.ok(parsed.success, `notes/${id}: ${parsed.success ? '' : JSON.stringify(parsed.error.issues)}`);
  }
});

test('articles and notes share one URL space without collisions', async () => {
  const [articles, notes] = await Promise.all([entries('articles'), entries('notes')]);
  const ids = [...articles, ...notes].map((entry) => entry.id);
  assert.equal(new Set(ids).size, ids.length, 'ids are unique across both collections');
});

test('a source with an empty url is treated as no source; a partial source is rejected', () => {
  const base = { title: 'T', description: 'D', date: '2026-10-14' };
  assert.equal(articleSchema().parse({ ...base, source: { title: '', url: '', author: '' } }).source, undefined);
  assert.equal(articleSchema().parse(base).source, undefined);
  assert.equal(
    articleSchema().safeParse({ ...base, source: { title: '', url: 'https://example.com/', author: '' } }).success,
    false,
  );
});
