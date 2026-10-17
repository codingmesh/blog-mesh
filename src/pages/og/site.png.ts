import type { APIRoute } from 'astro';
import { renderCard } from '../../lib/og';
import { site } from '../../config';

/** The default card for pages that are not posts. */
export const GET: APIRoute = async () => {
  const png = await renderCard({ title: site.tagline, kicker: site.focus });
  return new Response(png, { headers: { 'Content-Type': 'image/png' } });
};
