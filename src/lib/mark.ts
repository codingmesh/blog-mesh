/**
 * The site's tab icon: an M on a green tile. Drawn in a 48-unit box and shared by the favicon, the touch icon,
 * and the social cards. The header itself carries no mark; the name is the identity.
 */
export const markBox = 48;
export const markPaths = {
  letter: 'M13 35V14l11 12 11-12v21',
};

type MarkOptions = {
  size: number;
  tile?: string;
  paper?: string;
  /** Corner radius of the tile in box units. Zero for platforms that mask their own corners. */
  radius?: number;
};

export function markSvg({ size, tile = '#1f6b4f', paper = '#faf8f3', radius = 10 }: MarkOptions): string {
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${markBox} ${markBox}">`,
    `<rect width="${markBox}" height="${markBox}" rx="${radius}" fill="${tile}"/>`,
    `<path d="${markPaths.letter}" fill="none" stroke="${paper}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>`,
    `</svg>`,
  ].join('');
}

/** The mark as a data URI, for places that take an image source rather than markup. */
export const markDataUri = (options: MarkOptions) =>
  `data:image/svg+xml;charset=utf-8,${encodeURIComponent(markSvg(options))}`;
