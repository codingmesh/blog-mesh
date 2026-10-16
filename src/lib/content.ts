import type { CollectionEntry } from 'astro:content';
import { getCollection } from 'astro:content';
import { publishedEntries } from './publication';
import { site } from '../config';

type Post = CollectionEntry<'writing'>;

export const getWriting = async () => publishedEntries(await getCollection('writing'));

export function formatDate(date: Date) {
  return new Intl.DateTimeFormat(site.locale, { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' }).format(date);
}

export function readingTime(body = '') {
  const words = (body.match(/[a-zA-Z0-9]+/g) || []).length;
  return Math.max(1, Math.ceil(words / 220));
}

/** Human label for what a reader is opening: notes are a kind, reading notes are a format of article. */
export function formatLabel(post: Post) {
  return post.data.kind === 'note' ? 'note' : post.data.format === 'reading' ? 'reading note' : 'article';
}
