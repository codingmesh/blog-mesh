import { defineConfig, fontProviders } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import vercel from '@astrojs/vercel';
import keystatic from '@keystatic/astro';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeKatex from 'rehype-katex';
import rehypeSlug from 'rehype-slug';
import remarkMath from 'remark-math';
import { codeMetaTransformer } from './src/lib/code-meta.ts';
import rehypeDiagrams from './src/lib/diagrams.ts';
import rehypeFigures from './src/lib/figures.ts';
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
    // Three faces from one family, self-hosted at build time from Fontsource: Source Serif 4 for reading text,
    // Source Sans 3 for headings and interface, Source Code Pro for code and metadata.
    {
      name: 'Source Serif 4',
      cssVariable: '--font-serif',
      provider: fontProviders.fontsource(),
      weights: [400, 600],
      styles: ['normal', 'italic'],
      subsets: ['latin'],
      fallbacks: ['Georgia', 'Times New Roman', 'serif'],
    },
    {
      name: 'Source Sans 3',
      cssVariable: '--font-sans',
      provider: fontProviders.fontsource(),
      weights: [400, 500, 600, 700],
      styles: ['normal', 'italic'],
      subsets: ['latin'],
      fallbacks: ['-apple-system', 'Segoe UI', 'Helvetica', 'Arial', 'sans-serif'],
    },
    {
      name: 'Source Code Pro',
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
    // `dot` fences are diagrams, rendered by rehypeDiagrams rather than highlighted.
    syntaxHighlight: { type: 'shiki', excludeLangs: ['dot', 'math'] },
    shikiConfig: {
      themes: { light: 'github-light-high-contrast', dark: 'github-dark-high-contrast' },
      wrap: false,
      transformers: [codeMetaTransformer()],
    },
    remarkPlugins: [remarkMath],
    rehypePlugins: [
      rehypeDiagrams,
      rehypeFigures,
      // MathML output needs no stylesheet or fonts; browsers render it natively.
      [rehypeKatex, { output: 'mathml' }],
      // Heading ids before the anchors, so the links have targets; Astro keeps ids that already exist.
      rehypeSlug,
      [
        rehypeAutolinkHeadings,
        {
          behavior: 'prepend',
          // Empty content: the stylesheet draws the mark, so the heading text stays clean for the contents list.
          properties: { className: ['anchor'], ariaLabel: 'Link to this section' },
          content: [],
        },
      ],
    ],
  },
});
