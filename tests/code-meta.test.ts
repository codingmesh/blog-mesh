import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseCodeMeta } from '../src/lib/code-meta.ts';

test('fence meta yields a window title and the exact highlighted lines', () => {
  const meta = parseCodeMeta('title="src/check.ts" {2,5-7}');
  assert.equal(meta.title, 'src/check.ts');
  assert.deepEqual([...meta.lines].sort((a, b) => a - b), [2, 5, 6, 7]);
});

test('fences without meta, or with malformed ranges, highlight nothing', () => {
  assert.deepEqual(parseCodeMeta(undefined), { title: undefined, lines: new Set() });
  assert.deepEqual(parseCodeMeta("title='notes.md' {0,-3, 4-2}").lines, new Set([4]));
  assert.equal(parseCodeMeta("title='notes.md'").title, 'notes.md');
});
