import type { Element, Root } from 'hast';
import { fromHtml } from 'hast-util-from-html';
import { visit } from 'unist-util-visit';

/**
 * Diagrams from text, rendered at build time. A ```dot fence holds a Graphviz graph; the build renders it to SVG
 * with Graphviz compiled to WebAssembly (no browser, no service), restyles it in the site's tokens, and inlines it
 * as a figure. Fence meta accepts `caption="..."` and `title="..."` (the accessible name).
 */

/** Tokens the SVG is drawn with, mapped afterwards to the theme's custom properties. */
const colors = {
  ink: '#141414',
  muted: '#6a675f',
  accent: '#1f6b4f',
  paper: '#faf8f3',
};
const tokenFor: Record<string, string> = {
  [colors.ink]: 'var(--ink)',
  [colors.muted]: 'var(--muted)',
  [colors.accent]: 'var(--accent)',
  [colors.paper]: 'var(--paper)',
  black: 'var(--ink)',
  '#000000': 'var(--ink)',
  white: 'var(--paper)',
  '#ffffff': 'var(--paper)',
};

/**
 * Folio's defaults, inserted at the top of the graph so an author only writes nodes and edges. Layout is measured
 * with Courier, whose built-in metrics match a monospace face; the stylesheet then draws the labels in Plex Mono,
 * which has the same advance width, so the text fits the boxes Graphviz sized for it.
 */
export const diagramDefaults = [
  `graph [bgcolor="transparent", fontname="Courier", fontsize=12, fontcolor="${colors.muted}", pad=0.05, nodesep=0.4, ranksep=0.55]`,
  `node [shape=box, style="rounded", fontname="Courier", fontsize=12, color="${colors.muted}", fontcolor="${colors.ink}", height=0.44, margin="0.22,0.12", penwidth=1]`,
  `edge [color="${colors.muted}", fontname="Courier", fontsize=11, fontcolor="${colors.muted}", arrowsize=0.7, penwidth=1]`,
].join(';\n');

/** Graphviz sizes in points; the page works in pixels, and the natural size keeps labels at reading size. */
const px = (value: unknown) => {
  const match = String(value ?? '').match(/^([\d.]+)pt$/);
  return match ? Math.round((Number(match[1]) * 4) / 3) : undefined;
};

export function styleDot(source: string) {
  const brace = source.indexOf('{');
  if (brace === -1) return source;
  return `${source.slice(0, brace + 1)}\n${diagramDefaults};\n${source.slice(brace + 1)}`;
}

/** Strips the XML prolog and comments, sizes the drawing in pixels, and moves literal colors into theme tokens. */
export function themeSvg(svg: string): Element | undefined {
  const cleaned = svg
    .replace(/<\?xml[^>]*>/, '')
    .replace(/<!DOCTYPE[^>]*>/, '')
    .replace(/<!--[\s\S]*?-->/g, '');
  const root = fromHtml(cleaned, { fragment: true, space: 'svg' });
  const element = root.children.find((child): child is Element => child.type === 'element' && child.tagName === 'svg');
  if (!element) return undefined;
  const width = px(element.properties.width);
  const height = px(element.properties.height);
  if (width && height) {
    element.properties.width = width;
    element.properties.height = height;
  } else {
    delete element.properties.width;
    delete element.properties.height;
  }
  delete element.properties.xmlnsXLink;
  visit(element, 'element', (node, index, parent) => {
    // Graphviz emits a <title> per node and edge, which browsers show as tooltips.
    if (node.tagName === 'title' && parent && index !== undefined) {
      parent.children.splice(index, 1);
      return index;
    }
    const styles: string[] = [];
    for (const key of ['fill', 'stroke'] as const) {
      const value = node.properties[key];
      if (typeof value === 'string' && tokenFor[value.toLowerCase()]) {
        styles.push(`${key}:${tokenFor[value.toLowerCase()]}`);
        delete node.properties[key];
      }
    }
    if (node.properties.fontFamily !== undefined) delete node.properties.fontFamily;
    if (styles.length) node.properties.style = [node.properties.style, ...styles].filter(Boolean).join(';');
  });
  return element;
}

const quoted = (raw: string, key: string) => raw.match(new RegExp(`\\b${key}=(["'])(.*?)\\1`))?.[2];
const textOf = (node: Element): string =>
  node.children
    .map((child) => (child.type === 'text' ? child.value : child.type === 'element' ? textOf(child) : ''))
    .join('');

type Target = { parent: Root | Element; index: number; code: Element; meta: string };

export default function rehypeDiagrams() {
  let graphviz: Promise<{ dot(source: string, format: 'svg'): string }> | undefined;
  return async (tree: Root) => {
    const targets: Target[] = [];
    visit(tree, 'element', (node, index, parent) => {
      if (node.tagName !== 'pre' || !parent || index === undefined) return;
      const code = node.children.find(
        (child): child is Element => child.type === 'element' && child.tagName === 'code',
      );
      const classes = (code?.properties.className as string[] | undefined) ?? [];
      if (!code || !classes.includes('language-dot')) return;
      targets.push({ parent, index, code, meta: String((code.data as { meta?: string } | undefined)?.meta ?? '') });
    });
    if (!targets.length) return;
    graphviz ??= import('@hpcc-js/wasm-graphviz').then(({ Graphviz }) => Graphviz.load());
    const renderer = await graphviz;
    for (const { parent, index, code, meta } of targets) {
      const svg = themeSvg(renderer.dot(styleDot(textOf(code)), 'svg'));
      if (!svg) continue;
      const caption = quoted(meta, 'caption');
      svg.properties.role = 'img';
      svg.properties.ariaLabel = quoted(meta, 'title') || caption || 'Diagram';
      const children: Element[] = [
        { type: 'element', tagName: 'div', properties: { className: ['diagram-frame'] }, children: [svg] },
      ];
      if (caption) {
        children.push({
          type: 'element',
          tagName: 'figcaption',
          properties: {},
          children: [{ type: 'text', value: caption }],
        });
      }
      parent.children[index] = { type: 'element', tagName: 'figure', properties: { className: ['diagram'] }, children };
    }
  };
}
