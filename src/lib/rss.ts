import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { render } from 'astro:content';
import mdxRenderer from '@astrojs/mdx/server.js';
import reactRenderer from '@astrojs/react/server.js';
import sanitizeHtml from 'sanitize-html';
import { mdxComponents } from '../components/content/mdx-components';
import type { Post } from './content';

let container: Promise<AstroContainer> | undefined;

async function getContainer() {
  container ??= (async () => {
    const instance = await AstroContainer.create();
    instance.addServerRenderer({ renderer: mdxRenderer });
    instance.addServerRenderer({ renderer: reactRenderer });
    instance.addClientRenderer({ name: '@astrojs/react', entrypoint: '@astrojs/react/client.js' });
    return instance;
  })();
  return container;
}

/** Full post body as feed-safe HTML: no scripts, styles, classes, or interactive chrome. */
export async function renderPostHtml(post: Post) {
  const { Content } = await render(post);
  const html = await (await getContainer()).renderToString(Content, { props: { components: mdxComponents } });
  return sanitizeHtml(html, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'figure', 'figcaption', 'details', 'summary']),
    allowedAttributes: { a: ['href', 'rel'], img: ['src', 'alt', 'width', 'height'], td: ['align'], th: ['align'] },
    exclusiveFilter: (frame) => frame.tag === 'template' || (frame.attribs.class || '').includes('line-note'),
  });
}
