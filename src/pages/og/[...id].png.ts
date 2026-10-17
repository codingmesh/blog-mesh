import type { APIRoute } from 'astro';
import { formatDate, formatLabel, getAllWriting, type Post } from '../../lib/content';
import { renderCard } from '../../lib/og';

/** One social card per post: the mark, the topic and format, the title, and the date. */
export async function getStaticPaths() {
  const posts = await getAllWriting();
  return posts.map((post) => ({ params: { id: post.id }, props: { post } }));
}

export const GET: APIRoute = async ({ props }) => {
  const { post } = props as { post: Post };
  const kicker = [post.data.tags[0], formatLabel(post)].filter(Boolean).join(' / ');
  const png = await renderCard({ title: post.data.title, kicker, footer: formatDate(post.data.date) });
  return new Response(png, { headers: { 'Content-Type': 'image/png' } });
};
