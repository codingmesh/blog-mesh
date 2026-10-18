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
  description:
    'Notes on software and AI development. Reading notes on Claude Code, agent engineering, and the decisions behind this blog.',
  tagline: 'Notes on software and AI development.',
  focus: 'Software, AI, and reading notes',
  editorialNote:
    'Reading notes are prepared with AI assistance. Source claims, recommendations, and untested ideas are identified separately.',
  about: {
    intro:
      'This blog collects reading notes on Claude Code and agent engineering, alongside technical notes about the site itself.',
    scope:
      'Longer articles examine an engineering question through a cited source. Short notes document editorial decisions and repository behavior.',
    method:
      'Each reading note links to the original article and names its authors. The source publication date is kept separate from the date of the note. Reported measurements belong to the source authors; suggested applications are not presented as experiments conducted for this blog.',
  },
  themeColor: { light: '#fffcf0', dark: '#1f1e1d' },
  repo: 'codingmesh/blog-mesh',
} as const;

export const features = {
  /** Vercel Web Analytics, injected by the adapter when deployed on Vercel. */
  analytics: true,
} as const;
