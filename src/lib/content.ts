import type { CollectionEntry } from 'astro:content';
import { getCollection } from 'astro:content';
import { publishedEntries } from './publication';
import { site } from '../config';

export type Article = CollectionEntry<'articles'>;
export type Note = CollectionEntry<'notes'>;
export type Post = Article | Note;

export const getArticles = async (): Promise<Article[]> => publishedEntries(await getCollection('articles'));
export const getNotes = async (): Promise<Note[]> => publishedEntries(await getCollection('notes'));

/** Both collections in one publication-filtered, newest-first list. */
export async function getAllWriting(): Promise<Post[]> {
  const [articles, notes] = await Promise.all([getCollection('articles'), getCollection('notes')]);
  return publishedEntries<Post>([...articles, ...notes]);
}

export const isNote = (post: Post): post is Note => post.collection === 'notes';

/** Articles and notes share one URL space. */
export const postUrl = (post: Pick<Post, 'id'>) => `/writing/${post.id}/`;

export function formatDate(date: Date) {
  return new Intl.DateTimeFormat(site.locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}

export function readingTime(body = '') {
  const words = (body.match(/[a-zA-Z0-9]+/g) || []).length;
  return Math.max(1, Math.ceil(words / 220));
}

/** Human label for what a reader is opening: notes are a collection, reading notes are a format of article. */
export function formatLabel(post: Post) {
  return isNote(post) ? 'note' : post.data.format === 'reading' ? 'reading note' : 'article';
}
