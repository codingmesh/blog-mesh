/**
 * Site identity, locale, and feature switches. Templates read copy from here so it changes in one place.
 * Secrets and per-environment ids live in environment variables, not here.
 */
export const site = {
  name: 'Mikey',
  wordmark: 'mikey',
  locale: 'en-US',
  ogLocale: 'en_US',
  title: 'Mikey — Software, AI, and notes',
  description: 'Writing code and thinking things through. Notes on software engineering, AI, and what I am learning.',
  tagline: 'Writing code and thinking things through.',
  focus: 'Software, AI, and reading notes',
  themeColor: { light: '#faf8f3', dark: '#131412' },
  repo: 'codingmesh/blog-mesh',
} as const;

export const features = {
  /** Vercel Web Analytics, injected by the adapter when deployed on Vercel. */
  analytics: true,
} as const;
