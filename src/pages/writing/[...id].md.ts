import type { APIRoute } from 'astro';
import { formatDate, getAllWriting, postUrl, type Post } from '../../lib/content';

/** Each post's Markdown source, for "Copy as Markdown" and for anyone who wants the text without the page. */
export async function getStaticPaths() {
  const posts = await getAllWriting();
  return posts.map((post) => ({ params: { id: post.id }, props: { post } }));
}

export const GET: APIRoute = ({ props, site }) => {
  const { post } = props as { post: Post };
  const url = new URL(postUrl(post), site).href;
  const head = [
    `# ${post.data.title}`,
    '',
    `> ${post.data.description}`,
    '',
    `${formatDate(post.data.date)} · ${url}`,
    '',
  ];
  return new Response(`${head.join('\n')}\n${post.body ?? ''}`, {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  });
};
