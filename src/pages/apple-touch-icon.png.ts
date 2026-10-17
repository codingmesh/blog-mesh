import type { APIRoute } from 'astro';
import { Resvg } from '@resvg/resvg-js';
import { markSvg } from '../lib/mark';

/** The home-screen icon. Apple masks the corners itself, so the tile is drawn square. */
export const GET: APIRoute = () => {
  const png = new Resvg(markSvg({ size: 180, radius: 0 })).render().asPng();
  return new Response(new Uint8Array(png), { headers: { 'Content-Type': 'image/png' } });
};
