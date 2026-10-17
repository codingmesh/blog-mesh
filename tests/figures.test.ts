import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { Element, Properties, Root } from 'hast';
import rehypeFigures from '../src/lib/figures.ts';

const img = (properties: Properties): Element => ({
  type: 'element',
  tagName: 'img',
  properties,
  children: [],
});
const paragraph = (children: Element[]): Element => ({ type: 'element', tagName: 'p', properties: {}, children });

test('an image alone in a paragraph becomes a figure captioned by its alt text', () => {
  const tree: Root = { type: 'root', children: [paragraph([img({ src: '/a.png', alt: 'A caption.' })])] };
  rehypeFigures()(tree);
  const figure = tree.children[0] as Element;
  assert.equal(figure.tagName, 'figure');
  const [link, caption] = figure.children as Element[];
  assert.equal(link.tagName, 'a');
  assert.equal(link.properties.href, '/a.png');
  assert.equal((link.children[0] as Element).properties.loading, 'lazy');
  assert.equal(caption.tagName, 'figcaption');
  assert.deepEqual(caption.children, [{ type: 'text', value: 'A caption.' }]);
});

test('images without alt text, or beside other content, are left alone', () => {
  const bare = paragraph([img({ src: '/a.png', alt: '' })]);
  const inline = paragraph([
    img({ src: '/a.png', alt: 'Inline' }),
    { type: 'element', tagName: 'em', properties: {}, children: [] },
  ]);
  const tree: Root = { type: 'root', children: [bare, inline] };
  rehypeFigures()(tree);
  assert.equal((tree.children[0] as Element).tagName, 'p');
  assert.equal((tree.children[1] as Element).tagName, 'p');
});
