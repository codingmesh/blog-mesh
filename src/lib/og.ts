import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import satori, { type Font } from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { site } from '../config';
import { markDataUri } from './mark';

/**
 * Build-time social cards in the Folio style: paper, a green numeral or the site mark, the title in Newsreader's
 * display cut, the site name below a rule.
 * Satori reads TTF, so the fonts come from the TTF copies kept beside the WOFF2 files in src/assets/fonts.
 */
const paper = '#fffcf0';
const ink = '#1f1e1d';
const muted = '#6b675f';
const accent = '#1f6b4f';

const fontFile = (file: string) => resolve(process.cwd(), 'src/assets/fonts', file);
let fonts: Promise<Font[]> | undefined;
async function loadFonts() {
  fonts ??= Promise.all([
    readFile(fontFile('newsreader/Newsreader60pt-SemiBold.ttf')).then((data) => ({
      name: 'Display',
      data: toArrayBuffer(data),
      weight: 600 as const,
    })),
    readFile(fontFile('newsreader/Newsreader24pt-Regular.ttf')).then((data) => ({
      name: 'Serif',
      data: toArrayBuffer(data),
      weight: 400 as const,
    })),
    readFile(fontFile('jetbrains-mono/JetBrainsMono-Regular.ttf')).then((data) => ({
      name: 'Mono',
      data: toArrayBuffer(data),
      weight: 400 as const,
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
      width: 1200,
      height: 630,
      // Satori sizes boxes as content-box; without this the padding grows the canvas and the footer is cropped away.
      boxSizing: 'border-box',
      background: paper,
      color: ink,
      padding: '72px 80px 64px',
      fontFamily: 'Serif',
    },
    [
      el(
        'div',
        {
          display: 'flex',
          alignItems: 'baseline',
          gap: 24,
          fontFamily: 'Mono',
          fontSize: 26,
          color: accent,
          fontWeight: 400,
        },
        [
          number
            ? el('span', {}, number)
            : {
                type: 'img',
                props: { src: markDataUri({ size: 40 }), width: 40, height: 40, style: { marginBottom: 2 } },
              },
          kicker ? el('span', { color: muted }, kicker) : null,
        ],
      ),
      el(
        'div',
        { display: 'flex', flex: 1, alignItems: 'center' },
        el(
          'div',
          {
            fontFamily: 'Display',
            fontSize: titleSize,
            fontWeight: 600,
            lineHeight: 1.05,
            letterSpacing: '-0.02em',
            maxWidth: 1000,
          },
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
          el('span', { fontFamily: 'Display', fontWeight: 600 }, site.name),
          el('span', { fontFamily: 'Mono', fontSize: 20, color: muted }, footer || site.focus),
        ],
      ),
    ],
  );
  const svg = await satori(tree as never, { width: 1200, height: 630, fonts: await loadFonts() });
  return toArrayBuffer(new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } }).render().asPng());
}
