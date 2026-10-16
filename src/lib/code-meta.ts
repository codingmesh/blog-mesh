/**
 * Fence metadata for code windows: ```ts title="src/check.ts" {2,5-7}
 * `title` replaces the language label in the window bar; the line ranges are highlighted.
 */
export type CodeMeta = { title?: string; lines: Set<number> };

export function parseCodeMeta(raw = ''): CodeMeta {
  const title = raw.match(/\btitle=(["'])(.*?)\1/)?.[2] || undefined;
  const lines = new Set<number>();
  for (const range of raw.match(/\{([\d,\s-]+)\}/)?.[1].split(',') ?? []) {
    const [start, end = start] = range.trim().split('-').map(Number);
    if (!Number.isInteger(start) || start < 1) continue;
    for (let line = start; line <= Math.max(start, end); line++) lines.add(line);
  }
  return { title, lines };
}

type HastElement = { properties: Record<string, unknown> };
type TransformerContext = { options: { meta?: { __raw?: string } }; addClassToHast: (node: HastElement, className: string) => void };

/** Shiki transformer used by astro.config.mjs for Markdown and MDX fences. */
export function codeMetaTransformer() {
  const metaOf = (context: TransformerContext) => parseCodeMeta(context.options.meta?.__raw);
  return {
    name: 'blog-mesh:code-meta',
    pre(this: TransformerContext, node: HastElement) {
      const { title } = metaOf(this);
      if (title) node.properties['data-title'] = title;
    },
    line(this: TransformerContext, node: HastElement, line: number) {
      if (metaOf(this).lines.has(line)) this.addClassToHast(node, 'highlighted');
    },
  };
}
