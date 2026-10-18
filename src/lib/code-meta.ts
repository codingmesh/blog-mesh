/**
 * Fence metadata for code panels:
 *   ```ts title="src/check.ts" {2,5-7} note="Why these lines matter" caption="Figure text" wrap
 *   ```sh terminal
 * `title` names the tab, the ranges are highlighted, `note` is printed under the last highlighted line,
 * `caption` becomes a figure caption, `wrap` turns on soft wrapping for long commands, and `terminal` renders a
 * shell session: lines that start with `$ ` are commands with a prompt, the rest is output, and copy takes only
 * the commands.
 */
export type CodeMeta = {
  title?: string;
  lines: Set<number>;
  note?: string;
  caption?: string;
  wrap: boolean;
  terminal: boolean;
};

/** Splits a terminal line into its prompt and command, or returns undefined for output. */
export function commandOf(line: string) {
  const match = line.match(/^(\$|>|❯)\s(.*)$/);
  return match ? { prompt: match[1], command: match[2] } : undefined;
}

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
    terminal: /(^|\s)terminal(\s|$)/.test(raw),
  };
}

const textOf = (node: HastNode): string => (node.type === 'text' ? node.value : node.children.map(textOf).join(''));

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
      const { title, wrap, terminal } = metaOf(this);
      if (title) node.properties['data-title'] = title;
      if (wrap) node.properties['data-wrap'] = '';
      node.properties['data-lines'] = String(this.lines.length);
      if (terminal) node.properties['data-terminal'] = '';
    },
    line(this: TransformerContext, node: HastElement, line: number) {
      const meta = metaOf(this);
      if (meta.lines.has(line)) this.addClassToHast(node, 'highlighted');
      if (!meta.terminal) return;
      const command = commandOf(textOf(node));
      if (!command) {
        this.addClassToHast(node, 'output');
        return;
      }
      // The prompt is its own span so it is never copied; the command keeps its highlighting as plain text.
      this.addClassToHast(node, 'command');
      node.children = [
        element('span', { class: 'prompt', 'aria-hidden': 'true' }, [text(`${command.prompt} `)]),
        element('span', { class: 'command-text' }, [text(command.command)]),
      ];
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
