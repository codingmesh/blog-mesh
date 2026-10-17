import { defineConfig, fontProviders } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import vercel from '@astrojs/vercel';
import keystatic from '@keystatic/astro';
import { codeMetaTransformer } from './src/lib/code-meta.ts';
import { features } from './src/config.ts';

// Pages are prerendered everywhere. The CMS adds two on-demand routes, which need an adapter,
// so it is enabled in dev (served by the dev server) and on Vercel (served by a function).
const onVercel = Boolean(process.env.VERCEL);
const isDev = process.argv.includes('dev');

export default defineConfig({
  site: process.env.SITE_URL || 'http://localhost:4321',
  output: 'static',
  adapter: onVercel ? vercel({ webAnalytics: { enabled: features.analytics } }) : undefined,
  integrations: [
    mdx(),
    react(),
    sitemap({ filter: (page) => !/\/(404|keystatic|api)(\/|$)/.test(page) }),
    ...(onVercel || isDev ? [keystatic()] : []),
  ],
  fonts: [
    {
      name: 'IBM Plex Sans',
      cssVariable: '--font-sans',
      provider: fontProviders.fontsource(),
      weights: [400, 500, 600, 700],
      styles: ['normal', 'italic'],
      subsets: ['latin'],
      fallbacks: ['-apple-system', 'Segoe UI', 'Helvetica', 'Arial', 'sans-serif'],
    },
    {
      name: 'IBM Plex Mono',
      cssVariable: '--font-mono',
      provider: fontProviders.fontsource(),
      weights: [400, 500],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace'],
    },
  ],
  vite: {
    // Pre-bundle the editor's dependencies so the dev server does not re-optimize mid-session.
    optimizeDeps: {
      include: ['@keystatic/core', '@keystatic/core/ui', '@keystatic/core/content-components', 'react', 'react-dom'],
    },
  },
  markdown: {
    shikiConfig: {
      themes: { light: 'github-light-high-contrast', dark: 'github-dark-high-contrast' },
      wrap: false,
      transformers: [codeMetaTransformer()],
    },
  },
});
