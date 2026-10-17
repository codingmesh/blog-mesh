/**
 * The site mark: a page with a turned corner and two lines of text on a green tile.
 * One geometry, drawn in a 48-unit box, serves the favicon, the touch icon, the header, and the social cards.
 */
export const markBox = 48;
export const markPaths = {
  page: 'M15 11h12l8 8v18H15z',
  fold: 'M27 11v8h8z',
  lines: 'M19 25h12M19 30h12',
};
/** The turned corner is paper seen through at half strength, so it reads as a flap in both themes. */
export const foldOpacity = 0.55;

type MarkOptions = {
  size: number;
  /** Tile color; the page is cut out of it in the paper color. */
  tile?: string;
  paper?: string;
  /** Corner radius of the tile in box units. Zero for platforms that mask their own corners. */
  radius?: number;
};

export function markSvg({ size, tile = '#1f6b4f', paper = '#faf8f3', radius = 10 }: MarkOptions): string {
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${markBox} ${markBox}">`,
    `<rect width="${markBox}" height="${markBox}" rx="${radius}" fill="${tile}"/>`,
    `<path d="${markPaths.page}" fill="${paper}"/>`,
    `<path d="${markPaths.fold}" fill="${paper}" fill-opacity="${foldOpacity}"/>`,
    `<path d="${markPaths.lines}" stroke="${tile}" stroke-width="2" stroke-linecap="round"/>`,
    `</svg>`,
  ].join('');
}

/** The mark as a data URI, for places that take an image source rather than markup. */
export const markDataUri = (options: MarkOptions) =>
  `data:image/svg+xml;charset=utf-8,${encodeURIComponent(markSvg(options))}`;
