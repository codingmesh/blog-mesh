import { test } from 'node:test';
import assert from 'node:assert/strict';
import { highlightRanges, matchIndex } from '../src/scripts/search-match.ts';

const entries = [
  {
    title: 'Reliable automation starts with visible failures',
    description: 'Agents in the background',
    tags: ['Agent engineering'],
    format: 'reading notes',
    url: '/writing/a/',
  },
  {
    title: 'Build something you can discuss',
    description: 'Small observable results',
    tags: ['Development practice'],
    format: 'notes',
    url: '/writing/b/',
  },
];

test('every term must match somewhere in title, summary, topics, or format', () => {
  assert.deepEqual(
    matchIndex('reliable agent', entries).map((e) => e.url),
    ['/writing/a/'],
  );
  assert.deepEqual(
    matchIndex('reading', entries).map((e) => e.url),
    ['/writing/a/'],
  );
  assert.deepEqual(
    matchIndex('notes', entries).map((e) => e.url),
    ['/writing/a/', '/writing/b/'],
  );
  assert.deepEqual(matchIndex('reliable discuss', entries), []);
  assert.deepEqual(matchIndex('   ', entries), []);
});

test('highlight ranges do not overlap and prefer the longest term at a position', () => {
  assert.deepEqual(highlightRanges('Reliable automation', 'auto automation'), [{ start: 9, end: 19 }]);
  assert.deepEqual(highlightRanges('agent agents', 'agent'), [
    { start: 0, end: 5 },
    { start: 6, end: 11 },
  ]);
  assert.deepEqual(highlightRanges('nothing here', 'zzz'), []);
});
