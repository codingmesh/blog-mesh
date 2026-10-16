import { test } from 'node:test';
import assert from 'node:assert/strict';
import { publishedEntries } from '../src/lib/publication.ts';

test('drafts and scheduled posts are excluded from every public content consumer', () => {
  const now = new Date('2026-10-14T12:00:00Z');
  const entry = (id: string, date: string, draft = false) => ({ id, data: { date: new Date(date), draft } });
  const entries = [
    entry('older', '2026-10-01'),
    entry('private', '2026-10-14', true),
    entry('scheduled', '2026-10-15'),
    entry('today', '2026-10-14'),
  ];
  assert.deepEqual(
    publishedEntries(entries, now).map(({ id }) => id),
    ['today', 'older'],
  );
  assert.equal(entries[0].id, 'older', 'content loader output must not be reordered in place');
});
