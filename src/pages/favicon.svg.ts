import type { APIRoute } from 'astro';
import { markSvg } from '../lib/mark';

/** The browser-tab icon, drawn from the shared mark geometry. */
export const GET: APIRoute = () =>
  new Response(markSvg({ size: 48 }), { headers: { 'Content-Type': 'image/svg+xml' } });
