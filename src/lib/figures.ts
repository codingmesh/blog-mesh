import type { Element, Root, RootContent } from 'hast';
import { visit } from 'unist-util-visit';

/**
 * Markdown images become figures. A paragraph that holds only an image with alt text turns into
 * `<figure><a><img></a><figcaption>alt</figcaption></figure>`, so the caption is the alt text, the image is
 * lazy-loaded, and the link opens the full image when the lightbox script is not running. MDX files take the
 * same shape through the `img` component override in `mdx-components.ts`; this plugin covers plain Markdown.
 */
const isBlank = (node: RootContent) => node.type === 'text' && !node.value.trim();

export function figureFor(img: Element): Element | undefined {
  const alt = String(img.properties.alt ?? '').trim();
  const src = img.properties.src;
  if (!alt || typeof src !== 'string') return undefined;
  img.properties.loading ??= 'lazy';
  img.properties.decoding ??= 'async';
  return {
    type: 'element',
    tagName: 'figure',
    properties: { className: ['figure'] },
    children: [
      { type: 'element', tagName: 'a', properties: { className: ['figure-link'], href: src }, children: [img] },
      { type: 'element', tagName: 'figcaption', properties: {}, children: [{ type: 'text', value: alt }] },
    ],
  };
}

export default function rehypeFigures() {
  return (tree: Root, file?: { path?: string }) => {
    // MDX gets its figures from the `img` component override; wrapping here too would nest two figures.
    if (String(file?.path ?? '').endsWith('.mdx')) return;
    visit(tree, 'element', (node, index, parent) => {
      if (node.tagName !== 'p' || !parent || index === undefined) return;
      const content = node.children.filter((child) => !isBlank(child));
      const [only] = content;
      if (content.length !== 1 || only.type !== 'element' || only.tagName !== 'img') return;
      const figure = figureFor(only);
      if (figure) parent.children[index] = figure;
    });
  };
}
