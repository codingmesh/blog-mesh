import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getAllWriting, postUrl } from '../lib/content';
import { renderPostHtml } from '../lib/rss';
import { site } from '../config';

/** Full-content feed: readers get the whole post, including rendered MDX components as static HTML. */
export async function GET(context: APIContext) {
  const posts = await getAllWriting();
  const items = await Promise.all(
    posts.map(async (post) => ({
      title: post.data.title,
      pubDate: post.data.date,
      description: post.data.description,
      link: postUrl(post),
      author: site.name,
      categories: post.data.tags,
      content: await renderPostHtml(post),
    })),
  );
  return rss({
    title: site.title,
    description: site.description,
    site: context.site!,
    items,
    customData: `<language>${site.locale}</language>`,
  });
}
