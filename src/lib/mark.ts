/**
 * The site's icon: a lowercase m written in one loose stroke on a pale disc, the way an initial is signed in a
 * notebook margin. Drawn in a 100-unit box and shared by the favicon, the touch icon, and the social cards. The
 * header itself carries no mark; the name is the identity.
 */
export const markBox = 100;
export const markPaths = {
  /** Three uneven arches, so it reads as handwriting rather than type. */
  letter:
    'M21 71C22 55 27 41 34 42C42 43 40 58 40 70C41 55 45 41 53 43C61 45 58 60 58 70C59 55 63 41 71 44C79 47 77 60 79 71',
};

type MarkOptions = {
  size: number;
  /** Disc and stroke colors; the defaults are the light theme's paper tones and ink. */
  disc?: string;
  ink?: string;
  /** Fill the square behind the disc, for platforms that do not keep transparency. */
  background?: string;
  /** Stroke width in box units; thicker at tab sizes so the letter holds. */
  stroke?: number;
};

export function markSvg({ size, disc = '#ece6d8', ink = '#141414', background, stroke = 7.5 }: MarkOptions): string {
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${markBox} ${markBox}">`,
    background ? `<rect width="${markBox}" height="${markBox}" fill="${background}"/>` : '',
    `<circle cx="50" cy="50" r="50" fill="${disc}"/>`,
    `<path d="${markPaths.letter}" fill="none" stroke="${ink}" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round"/>`,
    `</svg>`,
  ].join('');
}

/** The mark as a data URI, for places that take an image source rather than markup. */
export const markDataUri = (options: MarkOptions) =>
  `data:image/svg+xml;charset=utf-8,${encodeURIComponent(markSvg(options))}`;
