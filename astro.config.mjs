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
    // Families from src/assets/fonts, per the guide in src/assets/fonts/README.md: Folio Serif for reading text,
    // Folio Sans for titles, headings, and the interface, JetBrains Mono for code and metadata. The Folio files are
    // variable (weight 300 to 800, optical size 16 to 48), one file per style.
    {
      name: 'Folio Serif',
      cssVariable: '--font-serif',
      provider: fontProviders.local(),
      options: {
        variants: [
          { weight: '300 800', style: 'normal', src: ['./src/assets/fonts/folio/FolioSerif-Roman.woff2'] },
          { weight: '300 800', style: 'italic', src: ['./src/assets/fonts/folio/FolioSerif-Italic.woff2'] },
        ],
      },
      fallbacks: ['Georgia', 'Times New Roman', 'serif'],
    },
    {
      name: 'Folio Sans',
      cssVariable: '--font-sans',
      provider: fontProviders.local(),
      options: {
        variants: [
          { weight: '300 800', style: 'normal', src: ['./src/assets/fonts/folio/FolioSans-Roman.woff2'] },
          { weight: '300 800', style: 'italic', src: ['./src/assets/fonts/folio/FolioSans-Italic.woff2'] },
        ],
      },
      fallbacks: ['-apple-system', 'Segoe UI', 'Helvetica', 'Arial', 'sans-serif'],
    },
    {
      name: 'JetBrains Mono',
      cssVariable: '--font-mono',
      provider: fontProviders.local(),
      options: {
        variants: [
          {
            weight: '100 800',
            style: 'normal',
            src: ['./src/assets/fonts/jetbrains-mono/JetBrainsMono-Variable.woff2'],
          },
        ],
      },
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
    // `dot` and `mermaid` fences are diagrams, rendered by rehypeDiagrams rather than highlighted.
    syntaxHighlight: { type: 'shiki', excludeLangs: ['dot', 'mermaid', 'math'] },
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
