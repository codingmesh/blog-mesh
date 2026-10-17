import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseCodeMeta } from '../src/lib/code-meta.ts';

test('fence meta yields a tab title and the exact highlighted lines', () => {
  const meta = parseCodeMeta('title="src/check.ts" {2,5-7}');
  assert.equal(meta.title, 'src/check.ts');
  assert.deepEqual(
    [...meta.lines].sort((a, b) => a - b),
    [2, 5, 6, 7],
  );
  assert.equal(meta.wrap, false);
});

test('fences without meta, or with malformed ranges, highlight nothing', () => {
  assert.deepEqual(parseCodeMeta(undefined), {
    title: undefined,
    lines: new Set(),
    note: undefined,
    caption: undefined,
    wrap: false,
  });
  assert.deepEqual(parseCodeMeta("title='notes.md' {0,-3, 4-2}").lines, new Set([4]));
  assert.equal(parseCodeMeta("title='notes.md'").title, 'notes.md');
});

test('notes, captions, and wrap are read independently of each other', () => {
  const meta = parseCodeMeta('{2-4} note="The union is the point" caption="A discriminated union." wrap');
  assert.equal(meta.note, 'The union is the point');
  assert.equal(meta.caption, 'A discriminated union.');
  assert.equal(meta.wrap, true);
  assert.equal(parseCodeMeta('caption="Only a caption"').note, undefined);
  assert.equal(parseCodeMeta('unwrapped').wrap, false, 'wrap must be a whole word');
});
