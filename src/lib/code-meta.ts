/**
 * Fence metadata for code panels:
 *   ```ts title="src/check.ts" {2,5-7} note="Why these lines matter" caption="Figure text" wrap
 * `title` names the tab, the ranges are highlighted, `note` is printed under the last highlighted line,
 * `caption` becomes a figure caption, and `wrap` turns on soft wrapping for long commands.
 */
export type CodeMeta = { title?: string; lines: Set<number>; note?: string; caption?: string; wrap: boolean };

const quoted = (raw: string, key: string) => raw.match(new RegExp(`\\b${key}=(["'])(.*?)\\1`))?.[2] || undefined;

export function parseCodeMeta(raw = ''): CodeMeta {
  const lines = new Set<number>();
  for (const range of raw.match(/\{([\d,\s-]+)\}/)?.[1].split(',') ?? []) {
    const [start, end = start] = range.trim().split('-').map(Number);
    if (!Number.isInteger(start) || start < 1) continue;
    for (let line = start; line <= Math.max(start, end); line++) lines.add(line);
  }
  return {
    title: quoted(raw, 'title'),
    lines,
    note: quoted(raw, 'note'),
    caption: quoted(raw, 'caption'),
    wrap: /(^|\s)wrap(\s|$)/.test(raw),
  };
}

type HastText = { type: 'text'; value: string };
type HastElement = { type: 'element'; tagName: string; properties: Record<string, unknown>; children: HastNode[] };
type HastNode = HastElement | HastText;
type HastRoot = { type: 'root'; children: HastNode[] };
type TransformerContext = {
  options: { meta?: { __raw?: string } };
  lines: HastElement[];
  addClassToHast: (node: HastElement, className: string) => void;
};

const element = (tagName: string, properties: Record<string, unknown>, children: HastNode[]): HastElement => ({
  type: 'element',
  tagName,
  properties,
  children,
});
const text = (value: string): HastText => ({ type: 'text', value });

/** Shiki transformer used by astro.config.mjs for Markdown and MDX fences. */
export function codeMetaTransformer() {
  const metaOf = (context: TransformerContext) => parseCodeMeta(context.options.meta?.__raw);
  return {
    name: 'blog-mesh:code-meta',
    pre(this: TransformerContext, node: HastElement) {
      const { title, wrap } = metaOf(this);
      if (title) node.properties['data-title'] = title;
      if (wrap) node.properties['data-wrap'] = '';
      node.properties['data-lines'] = String(this.lines.length);
      if (this.lines.length > 3) node.properties['data-gutter'] = '';
    },
    line(this: TransformerContext, node: HastElement, line: number) {
      if (metaOf(this).lines.has(line)) this.addClassToHast(node, 'highlighted');
    },
    code(this: TransformerContext, node: HastElement) {
      const { lines, note } = metaOf(this);
      if (!note || !lines.size) return;
      // The note is its own grid row directly under the last highlighted line. Copy ignores it.
      const last = Math.max(...lines);
      const index = node.children.findIndex(
        (child) => child.type === 'element' && child.tagName === 'span' && this.lines.indexOf(child) === last - 1,
      );
      if (index === -1) return;
      node.children.splice(
        index + 1,
        0,
        text('\n'),
        element('span', { class: 'line-note', 'data-pagefind-ignore': '' }, [text(note)]),
      );
    },
    root(this: TransformerContext, node: HastRoot) {
      const { caption } = metaOf(this);
      if (!caption) return;
      const pre = node.children.find((child) => child.type === 'element' && child.tagName === 'pre');
      if (!pre) return;
      node.children = [element('figure', { class: 'code-figure' }, [pre, element('figcaption', {}, [text(caption)])])];
    },
  };
}
