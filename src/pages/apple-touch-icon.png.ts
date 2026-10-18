import type { APIRoute } from 'astro';
import { Resvg } from '@resvg/resvg-js';
import { markSvg } from '../lib/mark';

/** The home-screen icon. iOS keeps no transparency, so the disc sits on a paper square. */
export const GET: APIRoute = () => {
  const png = new Resvg(markSvg({ size: 180, background: '#fffcf0' })).render().asPng();
  return new Response(new Uint8Array(png), { headers: { 'Content-Type': 'image/png' } });
};
