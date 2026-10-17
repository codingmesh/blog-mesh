import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { render } from 'astro:content';
import mdxRenderer from '@astrojs/mdx/server.js';
import reactRenderer from '@astrojs/react/server.js';
import sanitizeHtml from 'sanitize-html';
import { mdxComponents } from '../components/content/mdx-components';
import type { Post } from './content';
import { absolutize, feedReadyHtml } from './feed-html';

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
export async function renderPostHtml(post: Post, siteUrl: URL, articleUrl: string) {
  const { Content } = await render(post);
  const html = await (await getContainer()).renderToString(Content, { props: { components: mdxComponents } });
  const base = siteUrl.origin;
  return sanitizeHtml(absolutize(feedReadyHtml(html, new URL(articleUrl, base).href), base), {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat([
      'img',
      'figure',
      'figcaption',
      'details',
      'summary',
      'video',
      'section',
    ]),
    allowedAttributes: {
      a: ['href', 'rel'],
      img: ['src', 'srcset', 'sizes', 'alt', 'width', 'height'],
      video: ['src', 'poster', 'controls', 'width', 'height'],
      td: ['align'],
      th: ['align'],
    },
    allowedSchemes: ['http', 'https', 'mailto'],
    exclusiveFilter: (frame) => {
      const classes = frame.attribs.class || '';
      return (
        frame.tag === 'template' ||
        frame.tag === 'button' ||
        classes.includes('line-note') ||
        classes.includes('anchor') ||
        classes.includes('transcript-copy')
      );
    },
    transformTags: {
      // Autoplay chrome is page behavior; in a reader the video is an ordinary controlled player.
      video: (tagName, attribs) => ({ tagName, attribs: { ...attribs, controls: 'controls' } }),
    },
  });
}
