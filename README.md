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
- Code fences accept `title="path/file.ts"` for the tab, `{2,5-7}` to highlight lines, `note="..."` for a short explanation printed under the last highlighted line, `caption="..."` for a figure caption, and `wrap` to soft-wrap long commands. Line numbers appear automatically on blocks longer than three lines; blocks over 24 lines start folded. Use a title only for a real file and highlight lines only when the text refers to them.
- `<Aside kind="note" title="...">` sets a note, tip, or caution apart from the running text. It is also an editor block.
- MDX can use the components registered in `src/components/content/mdx-components.ts` without importing them, for example `<OutcomeExplorer />`. The editor offers the same components as blocks.
- `featured` is kept in the schema for future use; lists do not show a label.
- The initial reading notes and short notes are labeled AI-assisted samples.

## Interactive content

React components in `src/components/islands/` hydrate on the client. Wrap each one in a small Astro component that sets the client directive, register the wrapper in `mdx-components.ts`, and declare it in `keystatic.config.ts` so the editor can insert it. Islands must render their full content on the server; `OutcomeExplorer` is the reference example, an interactive version of the outcomes diagram in the first reading note. React loads only on pages that use an island.

## Design

The design is "Folio", approved from a static prototype before implementation (see `artifacts/prototypes-2026-10-16/`). It is a light, book-like index: one centered 760px column, the name and a focus line on the left of the header with a text navigation on the right, a large headline, and the homepage as a numbered table of contents with mono numerals in green. Notes are a plain list. Archive pages reuse the numbered rows under year labels with pill filters; article pages keep a 66-character measure, with the table of contents hanging in the right margin from 1280px and a collapsed version above the body elsewhere.

Type is IBM Plex Sans for everything readable and IBM Plex Mono for numbers, dates, metadata, and code, configured in `astro.config.mjs` through Astro's font API with the Fontsource provider; only Latin subsets are served and the body file is preloaded. Structure comes from hairlines: a one-pixel ink rule under the hero and above the footer, light rules between rows. There are no cards or panels except the code block.

Light palette: `#faf8f3` paper, `#141414` ink, `#6a675f` muted, `#1f6b4f` accent. Dark palette: `#131412`, `#ebe8e0`, `#9b978d`, `#6fbf9d`. Light is the default regardless of system preference; the toggle stores a choice of dark. Every text color meets WCAG AA in both themes.

Code always sits in a dark panel, in both themes. The panel has an editor-style tab (filename with a green underline, or the language), a line-number gutter on blocks longer than three lines, highlighted lines with a marker and an optional inline note, wrap and copy controls (copy flashes the lines and shows a check), folding for blocks over 24 lines, and an optional caption. Plex Mono at 14px on desktop and 13px on phones, horizontal scrolling, and print styles. Copied text never includes the notes.

Article typography follows the index: each section heading carries its numeral and the contents list mirrors it with a marker that slides between entries. Quotes carry quotation glyphs and a citation line, links that leave the site end with ↗, the source citation is two labeled rows, and a back-to-top control appears after a screen of scrolling. The theme toggle changes theme as a circular wipe from the button, and the search dialog rises into place. All motion is disabled under reduced motion and nothing animates on scroll-reveal.

A few crafted details sit on top of those rules. Pages navigate with Astro's client router, so the title you click morphs into the article headline and pages crossfade; both are off under reduced motion. Articles carry their index numeral large and faint in the header on wide screens and show a two-pixel green reading line along the top edge that fills as the body scrolls past. Hovering an index row turns its numeral into an arrow. The site mark is a page with a turned corner and two lines of text on a green tile, chosen from three rendered candidates; its geometry lives once in `src/lib/mark.ts` and serves the favicon, the touch icon, the header (where the corner turns further on hover), and the social cards. The header also has a search entry with its ⌘K hint, the footer is a colophon, and the 404 page is entry 00. Every post has a generated social card at `/og/<id>.png`, rendered at build time with Satori from the Fontsource Plex files, and the site card at `/og/site.png` serves the other pages. Scripts register through `src/scripts/page.ts` so they run again after each client-side navigation without piling up listeners.

Index pages (home, Writing, Notes, About, and 404) carry a wind in their margins: a field of small Plex Mono characters that the wind lights as it passes. It is one surface with two soft masks: the field is strongest around the page head and settles below the ink rule, and the reading column dims to a quarter so the index stays quiet; the pointer's ripples pass through both, so a click travels across the whole page. Moving the pointer warms the air along its path, a click on empty paper blows a ripple in the accent green, and every third click is a heart. Each visit gets its own wind, and it settles after three minutes without input. The renderer (`src/scripts/wind.ts`, two WebGL2 shaders adapted from MyGo's wind example under MIT, see `public/third-party-notices.txt`) loads lazily and only on pointer devices 900px and wider without a reduced-motion preference; phones, tablets, article pages, print, and browsers without WebGL2 get plain paper. Pages opt in with the `wind` prop on `Base`.

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
