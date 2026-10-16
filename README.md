# Mikey's personal blog

A content-first blog in American English (`en-US`), built with Astro, TypeScript, Markdown/MDX, and plain CSS. Pagefind provides full-text search.

## Project language

Use US English throughout project-authored code, comments, documentation, research, UI copy, and human-readable data. The durable rules are in `AGENTS.md`.

Run `npm run check:language` to inspect project text, including research notes and text artifacts. It also runs as part of `npm run check`. The guard detects common East Asian text, legacy locale markers, and incorrect central locale settings; it is not a general language classifier or spelling checker. Dependencies, caches, secrets, and binary files are excluded. Generated website content is verified through the build.

Original reference screenshots and historical captures remain intact as evidence. Their captions and explanations use English. Translated historical data labels are marked explicitly, with measurements preserved.

## Run locally

Use Node.js 22.18 or later, with native TypeScript test support. Dependencies are locked in `package-lock.json`.

```sh
npm ci
npm run dev
```

Development mode searches titles, summaries, topics, and content formats. The production build includes full-text search, with the same lightweight index as a fallback if Pagefind cannot load.

```sh
npm run check
npm test
npm run build
npm run preview -- --host 127.0.0.1 --port 4321
```

## Write a post

Create a `.md` or `.mdx` file in `src/content/writing/`:

```yaml
---
title: My article title
description: A short explanation of what this article covers.
date: 2026-10-14
kind: article # article or note
format: essay # essay or reading
tags: [Development practice] # Topics only; use format for reading notes.
featured: false
draft: false
sample: false
---
```

- The filename determines the URL: `my-post.md` becomes `/writing/my-post/`.
- `kind: note` appears on the notes page. All published content is included in RSS and search.
- `tags` describe topics; `format: reading` identifies a reading note.
- The homepage is the article feed itself: title, summary, date, and reading time. The archive groups posts by year with topic filters.
- `featured: true` is kept in the schema for future use; lists do not show a label.
- Drafts and future-dated entries are excluded from public pages. Scheduled posts require a new build after their publication date.
- Optional `source` metadata contains `title`, `url`, and `author`, displayed above the article.
- Code fences accept `title="path/file.ts"` to name the window and `{2,5-7}` to highlight lines, for example ```` ```ts title="src/check.ts" {2-4} ````. Use a title only for a real file and highlight lines only when the text refers to them.
- The initial three claude.dev reading notes and two short notes are labeled as AI-assisted samples. Research files are kept outside the public build.
- `src/config.ts` defines the site identity, locale, tagline, focus line, and theme colors. The header, footer, and About page read from it, so author copy changes in one place. Longer About prose lives in `src/pages/about.astro`.

## Language and design

The site uses `en-US` for document language, dates, and RSS, and `en_US` for Open Graph. Dates display as `Oct 14, 2026`; date-only content metadata is formatted in UTC to prevent day shifts. Navigation, posts, diagrams, search states, and accessibility labels use English.

The design is bare and dark by default, with one hot color. Article titles are the identity: Space Grotesk, large, set in a coral accent, and they fill solid on hover and focus. Body text is Hanken Grotesk; dates, metadata, filters, and code use JetBrains Mono. All three are self-hosted variable fonts from Fontsource; a page downloads only the Latin subsets, about 125 KB in total, with the display and body files preloaded. There is no intro block, no hairlines between entries, and no tags or counts on lists. On screens 1100px and wider the column sits left of center and the article's table of contents uses the space on the right.

Dark palette: `#0e0f11` background, `#ebe9e3` ink, `#9b9b94` muted, and `#ff6b3d` accent. Light palette: `#f3f2ee`, `#17181a`, `#5e5f5b`, and `#b8390f`. Dark is the default regardless of system preference; the toggle stores a choice of light. Every text color meets WCAG AA against its background in both themes, including inverted text on a filled title. One corner radius, 4px, is used everywhere.

Code blocks are flat windows with a single border: decorative traffic-light dots, a centered language or filename label, and a copy button. The dots are not interactive. Code uses high-contrast light/dark themes at 14px on desktop and 13px on phones, with horizontal scrolling and print styles. Highlighted lines use an accent tint across the full scrollable width; copied text is unaffected.

## Publish

Set `SITE_URL` to the real domain before deployment, for example `https://blog.example.com`. Without it, canonical URLs, RSS, and the sitemap use the local preview address.

For Vercel, import the GitHub repository, use `npm run build`, and publish `dist`. Static deployment does not require a server adapter. This project has not been connected to a remote repository or deployed publicly.

## Validation

`npm run check` validates Astro and TypeScript. The regression tests protect publication filtering and ordering, including drafts and scheduled content, and the code-fence metadata parser that drives window titles and highlighted lines. Visual copy and styling do not receive redundant tests.

Browser checks cover responsive layout, themes, search, topic filters, table-of-contents links, copy feedback, and keyboard navigation. Search offers topic suggestions, highlighted matches, arrow-key navigation, Escape dismissal, and recovery actions. Printing hides navigation and switches to a paper-friendly palette.

Historical research and design-review records remain in `research/`; they are not served by the website.
