import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import satori, { type Font } from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { site } from '../config';

/**
 * Build-time social cards in the Folio style: paper, a green numeral, the title in Plex, the site name below a rule.
 * Fonts are read from the Fontsource packages, which ship WOFF files Satori can consume.
 */
const paper = '#faf8f3';
const ink = '#141414';
const muted = '#6a675f';
const accent = '#1f6b4f';

const fontFile = (pkg: string, file: string) => resolve(process.cwd(), 'node_modules/@fontsource', pkg, 'files', file);
let fonts: Promise<Font[]> | undefined;
async function loadFonts() {
  fonts ??= Promise.all([
    readFile(fontFile('ibm-plex-sans', 'ibm-plex-sans-latin-700-normal.woff')).then((data) => ({
      name: 'Plex',
      data: toArrayBuffer(data),
      weight: 700 as const,
    })),
    readFile(fontFile('ibm-plex-sans', 'ibm-plex-sans-latin-400-normal.woff')).then((data) => ({
      name: 'Plex',
      data: toArrayBuffer(data),
      weight: 400 as const,
    })),
    readFile(fontFile('ibm-plex-mono', 'ibm-plex-mono-latin-500-normal.woff')).then((data) => ({
      name: 'Plex Mono',
      data: toArrayBuffer(data),
      weight: 500 as const,
    })),
  ]);
  return fonts;
}
const toArrayBuffer = (buffer: Uint8Array) =>
  buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength) as ArrayBuffer;

type Node = { type: string; props: Record<string, unknown> };
const el = (type: string, style: Record<string, unknown>, children?: unknown): Node => ({
  type,
  props: { style, children },
});

export type CardInput = { title: string; kicker?: string; number?: string; footer?: string };

export async function renderCard({ title, kicker, number, footer }: CardInput): Promise<ArrayBuffer> {
  const titleSize = title.length > 70 ? 54 : title.length > 44 ? 62 : 72;
  const tree = el(
    'div',
    {
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
      height: '100%',
      background: paper,
      color: ink,
      padding: '72px 80px 64px',
      fontFamily: 'Plex',
    },
    [
      el(
        'div',
        {
          display: 'flex',
          alignItems: 'baseline',
          gap: 24,
          fontFamily: 'Plex Mono',
          fontSize: 26,
          color: accent,
          fontWeight: 500,
        },
        [
          number
            ? el('span', {}, number)
            : el('span', { width: 14, height: 14, background: accent, borderRadius: 3, marginBottom: 2 }),
          kicker ? el('span', { color: muted }, kicker) : null,
        ],
      ),
      el(
        'div',
        { display: 'flex', flex: 1, alignItems: 'center' },
        el(
          'div',
          { fontSize: titleSize, fontWeight: 700, lineHeight: 1.05, letterSpacing: '-0.03em', maxWidth: 1000 },
          title,
        ),
      ),
      el(
        'div',
        {
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderTop: `2px solid ${ink}`,
          paddingTop: 22,
          fontSize: 24,
        },
        [
          el('span', { fontWeight: 700 }, site.name),
          el('span', { fontFamily: 'Plex Mono', fontSize: 20, color: muted }, footer || site.focus),
        ],
      ),
    ],
  );
  const svg = await satori(tree as never, { width: 1200, height: 630, fonts: await loadFonts() });
  return toArrayBuffer(new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } }).render().asPng());
}
