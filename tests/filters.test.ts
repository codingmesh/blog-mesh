import { test } from 'node:test';
import assert from 'node:assert/strict';
import { emptyMessage, filterByTag, filterStatus } from '../src/scripts/filters.ts';

const items = [{ tags: ['Agent engineering'] }, { tags: ['Context engineering', 'Agent engineering'] }, { tags: [] }];

test('an empty topic shows everything and a topic shows only matching items', () => {
  assert.deepEqual(filterByTag(items, ''), [true, true, true]);
  assert.deepEqual(filterByTag(items, 'Agent engineering'), [true, true, false]);
  assert.deepEqual(filterByTag(items, 'Unknown topic'), [false, false, false]);
});

test('status copy pluralizes and names the active topic', () => {
  assert.deepEqual(filterStatus('', 3), { count: '3', noun: 'articles', status: 'All topics: 3 articles' });
  assert.deepEqual(filterStatus('Context engineering', 1), {
    count: '1',
    noun: 'article',
    status: 'Context engineering: 1 article',
  });
  assert.equal(emptyMessage('Unknown topic'), 'No articles about “Unknown topic” yet.');
  assert.equal(emptyMessage(''), 'New articles are on the way.');
});
