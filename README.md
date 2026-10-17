# Mikey's personal blog

A content-first blog in American English (`en-US`), built with Astro 7, TypeScript, MDX, React islands, and plain CSS. Keystatic edits the content files, Pagefind provides full-text search, and Vercel hosts the static output plus the two on-demand routes the editor needs.

Source: https://github.com/codingmesh/blog-mesh

## Project map

```
src/
  config.ts               site identity, locale, theme colors, feature switches
  content.config.ts       two collections: articles and notes
  content/articles/       .mdx and .md essays and reading notes
  content/notes/          short notes
  lib/                    schema.ts, content.ts (queries and labels), publication.ts, code-meta.ts, rss.ts
  layouts/Base.astro      document shell, fonts, theme bootstrap
  components/site/        Header, Footer, ThemeToggle, Search
  components/content/     Feed, PostRow, SourceLine, TableOfContents, CodeWindows, Comments, OutcomeExplorer (MDX wrapper)
  components/islands/     React components that hydrate on the client
  scripts/                theme, filters, toc, code-windows, search, search-match
  styles/                 tokens.css, base.css, prose.css (all other styles are scoped to their component)
  pages/                  routes, RSS, sitemap, robots, search index
keystatic.config.ts       the editor's view of the collections
scripts/                  check-language, check-links, pagefind
tests/                    node:test suites for pure logic and the content model
.github/workflows/        ci.yml and scheduled-publish.yml
research/, artifacts/     design and architecture records; not served
```

## Run locally

Use Node.js 22.18 or later (see `.nvmrc`); it runs the TypeScript tests and scripts without a build step. Dependencies are locked in `package-lock.json`.

```sh
npm ci
npm run dev
```

The dev server runs at http://127.0.0.1:4321/ and the editor at http://127.0.0.1:4321/keystatic. In development the editor writes directly to the files in `src/content/`, and search uses the lightweight title and summary index; the production build adds Pagefind full-text search.

```sh
npm run check     # language guard, Prettier, Astro and TypeScript diagnostics
npm test          # unit tests
npm run build     # static site in dist/ plus the search index
npm run check:links
npm run preview -- --host 127.0.0.1 --port 4321
```

## Write

Two ways, same files.

**Editor.** Open `/keystatic`, pick Articles or Notes, and write. Locally the save lands in `src/content/`. In production the editor commits to the GitHub repository on your behalf (see Deployment), and Vercel builds the result. Drafts stay private until `draft` is unchecked; future dates publish on the next build, which the daily scheduled workflow triggers.

**Files.** Create a `.md` or `.mdx` file in `src/content/articles/` or `src/content/notes/`:

```yaml
---
title: My article title
description: A short explanation of what this article covers.
date: '2026-10-14'
tags: [Development practice]
draft: false
sample: false
# articles only
format: essay # essay or reading
featured: false
source: # optional; leave url empty for none
  title: ''
  url: ''
  author: ''
---
```

- The filename is the URL: `my-post.md` becomes `/writing/my-post/` for both collections, so an article and a note cannot share a filename. The build fails if they do.
- Code fences accept `title="path/file.ts"` to name the window and `{2,5-7}` to highlight lines. Use a title only for a real file and highlight lines only when the text refers to them.
- MDX can use the components registered in `src/components/content/mdx-components.ts` without importing them, for example `<OutcomeExplorer />`. The editor offers the same components as blocks.
- `featured` is kept in the schema for future use; lists do not show a label.
- The initial reading notes and short notes are labeled AI-assisted samples.

## Interactive content

React components in `src/components/islands/` hydrate on the client. Wrap each one in a small Astro component that sets the client directive, register the wrapper in `mdx-components.ts`, and declare it in `keystatic.config.ts` so the editor can insert it. Islands must render their full content on the server; `OutcomeExplorer` is the reference example, an interactive version of the outcomes diagram in the first reading note. React loads only on pages that use an island.

## Design

A studio layout: on screens 1024px and wider a sticky left rail holds the wordmark, a one-line focus statement, navigation, search, and theme controls, and the content gets a wide stage to the right. Below 1024px the rail becomes a top bar, and on the narrowest phones navigation wraps onto its own row. Headlines are Schibsted Grotesk, reading text is Instrument Sans, and dates, metadata, and code are JetBrains Mono. Fonts are configured in `astro.config.mjs` through Astro's font API with the Fontsource provider; only Latin subsets are served and the display and body files are preloaded.

The homepage is composed: a statement headline, the newest article as a featured card, the rest as a card grid, and notes in a panel. Archive pages use date-column rows with hairlines; article pages keep a 720px measure with the table of contents in a side column from 1360px. Cards, code windows, quotes, the interactive diagram, and the search chips sit on an elevated surface with a hairline border and a faint inner highlight, over a page with a soft accent glow at the top. Hover is one language everywhere: an underline that draws in from the left, and a two-pixel lift on cards.

Dark palette: `#0b0c0f` page, `#0e1013` rail, `#13161a` surface, `#ecebe6` ink, `#9a9c99` muted, `#ff6b3d` accent. Light palette: `#f6f4ee`, `#f0ede5`, `#fbfaf6`, `#17181a`, `#5e5d57`, `#b03a0e`. Dark is the default regardless of system preference; the toggle stores a choice of light. Radii are 10px for panels and 6px for controls; filter chips and tags are pills.

Code blocks are flat windows with a single border and a transparent bar: small decorative traffic-light dots, a centered language or filename label, and a muted copy button that turns to ink on hover. Code uses high-contrast light/dark themes at 14px on desktop and 13px on phones, with horizontal scrolling and print styles. Highlighted lines use an accent tint across the full scrollable width; copied text is unaffected.

## Comments, analytics, and feeds

- **Comments** use giscus on GitHub Discussions and render only when `PUBLIC_GISCUS_REPO`, `PUBLIC_GISCUS_REPO_ID`, and `PUBLIC_GISCUS_CATEGORY_ID` are set. Enable Discussions on the repository, install the giscus app, and copy the ids from https://giscus.app into the environment. The embed follows the site theme.
- **Analytics** are Vercel Web Analytics, enabled by the adapter when deployed on Vercel and switched in `src/config.ts`.
- **RSS** at `/rss.xml` carries the full body of every post, including MDX components rendered as static HTML, sanitized for feed readers.

## Deployment

The site is live at https://blog-mesh-nu.vercel.app, deployed from the `blog-mesh` project in Vercel. The GitHub repository is connected, so every push to `main` builds and deploys automatically, and pull requests get preview deployments. `SITE_URL` is set in the production environment; on Vercel the build adds the adapter and the editor routes, while local and CI builds stay fully static with `dist/` as the output.

Environment variables still to set in Vercel for the remaining features:

| Variable                                                                           | Purpose                                                                                                                                                                                                       |
| ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `KEYSTATIC_GITHUB_CLIENT_ID`, `KEYSTATIC_GITHUB_CLIENT_SECRET`, `KEYSTATIC_SECRET` | Editor sign-in at `/keystatic`. Create a GitHub App for the repository and copy its credentials; see https://keystatic.com/docs/github-mode. Until then the editor shows a login button that cannot complete. |
| `PUBLIC_GISCUS_REPO_ID`, `PUBLIC_GISCUS_CATEGORY_ID`                               | Comments, see above                                                                                                                                                                                           |

To publish scheduled entries, create a deploy hook in the Vercel project settings and store it as the `VERCEL_DEPLOY_HOOK` repository secret; the `Scheduled publish` workflow calls it daily. To use a custom domain, add it in Vercel and update `SITE_URL` to match.

## Validation

CI runs on every push and pull request: the language guard, Prettier, Astro and TypeScript diagnostics, unit tests, the production build, and an internal link check over the built pages.

Tests cover publication rules (drafts and future dates), the content schemas against every file on disk, code-fence metadata, topic filtering, and search matching. Styling and copy are verified in the browser rather than by tests. Historical design and architecture reviews remain in `research/`; they are not served by the website.
