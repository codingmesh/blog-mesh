import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import { codeMetaTransformer } from './src/lib/code-meta.ts';

export default defineConfig({
  site: process.env.SITE_URL || 'http://localhost:4321',
  integrations: [mdx(), sitemap({ filter: (page) => !page.endsWith('/404/') && !page.endsWith('/404') })],
  markdown: {
    shikiConfig: {
      themes: { light: 'github-light-high-contrast', dark: 'github-dark-high-contrast' },
      wrap: false,
      transformers: [codeMetaTransformer()],
    },
  },
});
