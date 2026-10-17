import type { APIRoute } from 'astro';
import { formatDate, formatLabel, getAllWriting, getArticles, getNotes, isNote, type Post } from '../../lib/content';
import { renderCard } from '../../lib/og';

/** One social card per post, numbered like the index it came from. */
export async function getStaticPaths() {
  const [posts, articles, notes] = await Promise.all([getAllWriting(), getArticles(), getNotes()]);
  const numberOf = (post: Post) => {
    const list: Post[] = isNote(post) ? notes : articles;
    return String(list.findIndex((entry) => entry.id === post.id) + 1).padStart(2, '0');
  };
  return posts.map((post) => ({ params: { id: post.id }, props: { post, number: numberOf(post) } }));
}

export const GET: APIRoute = async ({ props }) => {
  const { post, number } = props as { post: Post; number: string };
  const kicker = [post.data.tags[0], formatLabel(post)].filter(Boolean).join(' / ');
  const png = await renderCard({ title: post.data.title, number, kicker, footer: formatDate(post.data.date) });
  return new Response(png, { headers: { 'Content-Type': 'image/png' } });
};
