# Re-architecture on Astro

Date: October 16, 2026. After two visual redesigns the same day, the owner asked for the stack and architecture to be redone for four drivers: interactive content in articles, an author workflow that does not need a local build, dynamic features, and code quality and operations. They chose to keep Astro as the engine. The bare dark design from `redesign-bare-2026-10-16.md`, all article content, every route, and the navigation are unchanged.

## What changed

| Area | Before | After |
|---|---|---|
| Version control | None | Git repository, public at https://github.com/codingmesh/blog-mesh, initial-state commit first so every change is a diff |
| CI | None | GitHub Actions: language guard, Prettier, Astro and TypeScript diagnostics, tests, build, internal link check; a daily workflow that calls a Vercel deploy hook so scheduled entries publish |
| Hosting | None configured | Vercel adapter, applied only when `VERCEL` is set; local and CI builds stay fully static in `dist/` |
| Content model | One `writing` collection with a `kind` field | `articles` and `notes` collections sharing a base schema in `src/lib/schema.ts`; URLs unchanged; the build fails on an id collision |
| Authoring | Edit files, run a build | Keystatic at `/keystatic`: local mode in dev, GitHub mode in production; both collections mapped field for field; the article component is available as an editor block |
| Interactivity | None | React 19 islands under `src/components/islands/`, exposed to MDX through Astro wrappers without imports; `OutcomeExplorer` replaces the static state diagram and renders the full diagram without JavaScript |
| Styles | One 25 KB global stylesheet | `tokens.css`, `base.css`, `prose.css` global; every other rule scoped to its component or page |
| Scripts | Inline in page templates | `src/scripts/*.ts` modules with pure functions; tests for filtering, search matching, fence metadata, publication rules, and the content model |
| Fonts | Fontsource CSS imports and manual preloads | Astro's font API with the Fontsource provider; Latin subsets only, metric fallbacks generated, display and body preloaded |
| RSS | Summaries | Full post bodies rendered through the Astro container with the MDX and React renderers, sanitized |
| Comments and analytics | None | giscus component that renders only when its three ids are configured; Vercel Web Analytics switched in config |
| Formatting | None | Prettier with the Astro plugin, enforced in CI |

## Decisions worth remembering

- **Keystatic is enabled only where an adapter exists.** Its two routes are on-demand, so the integration is added in dev and on Vercel. Local and CI builds never see it and stay static, which keeps `astro preview`, Pagefind, and the link check simple.
- **MDX components are injected, not imported.** `src/components/content/mdx-components.ts` maps names to Astro wrappers that carry the client directive. The editor cannot write import statements, and this keeps article files free of paths.
- **Frontmatter dates are quoted in the files written by hand.** Keystatic parses frontmatter with a YAML loader; its own serializer writes unquoted dates and reads them back, so either form works for both sides.
- **Keystatic normalizes frontmatter on first save.** It writes unquoted scalars, folds long summaries, lists topics one per line, and adds explicit `draft: false`. Values are preserved; the body is byte-identical apart from the blank line after the frontmatter. One article was saved through the editor during verification and is committed in that form.
- **First dev start.** Vite re-optimized the editor's dependencies mid-session on the very first run and served stale bundles until a restart. Pre-bundling them in `astro.config.mjs` avoids this; the README notes the restart as a fallback.

## Verification

- `npm run check`, `npm test` (10 tests), `npm run build` (10 pages, 5 indexed by Pagefind), `npm run check:links` (167 internal references across 10 pages), and `npm run format:check` all pass locally, which is exactly what CI runs.
- Design unchanged: homepage first title at 116px with three titles inside a 1280×720 first screen, column left edge at 141px, phone body 17px starting at about 547px, table of contents visible beside the article from 1100px. Screenshots in `artifacts/architecture-2026-10-16/` match the previous round.
- 20 of 20 page and width combinations without horizontal overflow; browser accessibility audit 0 violations on five pages in the dark default.
- Island: server HTML contains all three outcomes; after hydration, selecting an outcome shows `describe()` output and `aria-pressed` updates; the React runtime and island chunk are referenced only by the article that uses it.
- Editor: both collections list every entry; the first article was opened, toggled to draft, saved, toggled back, and saved; the result re-opens correctly on a clean dev start.
- RSS: five items, each with `content:encoded` holding the rendered body.
- Not covered: a deployed Vercel build, GitHub-mode editing, giscus with real ids, a full screen-reader pass.

## Owner-only setup that remains

1. Import the GitHub repository into Vercel and set `SITE_URL`.
2. On the deployed site, open `/keystatic` and follow the first-run flow to create the GitHub App, then set `KEYSTATIC_GITHUB_CLIENT_ID`, `KEYSTATIC_GITHUB_CLIENT_SECRET`, and `KEYSTATIC_SECRET` in Vercel.
3. Create a Vercel deploy hook and store it as the `VERCEL_DEPLOY_HOOK` repository secret for scheduled publishing.
4. Enable Discussions, install giscus, and set the three `PUBLIC_GISCUS_*` variables.
5. Supply real identity details for the About page, still a labeled placeholder.

## Results

![Homepage, unchanged design](/Users/mikey/Projects/personal/blog-mesh/artifacts/architecture-2026-10-16/home-desktop.jpg)

![Article with the interactive outcome explorer](/Users/mikey/Projects/personal/blog-mesh/artifacts/architecture-2026-10-16/island-selected.jpg)

![Keystatic: articles collection](/Users/mikey/Projects/personal/blog-mesh/artifacts/architecture-2026-10-16/keystatic-articles.jpg)

![Keystatic: editing an article](/Users/mikey/Projects/personal/blog-mesh/artifacts/architecture-2026-10-16/keystatic-entry.jpg)

## Detail pass, later the same day

A review of the captures found two bugs and a set of finish details, all fixed and re-verified (overflow 20 of 20, accessibility audit 0 violations, Lighthouse 100 across all four categories on the homepage and an article before the pass):

- The archive intro rendered "3articles" after formatting removed a space between two spans; the space is now explicit.
- The prose list rule leaked into the outcome explorer, pushing its second and third buttons 8px lower than the first; the island resets it.
- The theme toggle now shows the destination mode: a sun while dark, a moon while light.
- The collapsed table of contents uses an accent chevron that rotates open instead of the native triangle.
- The source citation puts the attribution on its own line so names no longer break mid-way.
- Code blocks get thin themed scrollbars; figures and captions have styles ready for images.
- Prose CSS is imported only by the article and About pages, so list pages ship one stylesheet.

## Visible refinement pass

The owner asked for changes they could see, and chose all four candidates. Before captures are in `artifacts/architecture-2026-10-16/`, after captures in `artifacts/polish-2026-10-16/`.

- **Homepage rhythm.** A one-line mono kicker (the focus line from config) gives the feed a top, and the newest entry is set at up to 50px with a 20px summary; later entries stay at 38px. Three titles still fit a 1280×800 first screen; two fit 720.
- **Article header.** The source citation moved into the header stack under the meta row, and a 28px accent rule separates the header from the body. The phone body now starts at about 575px, inside the 560 to 600 target.
- **Code windows.** The bar is transparent with a hairline, dots are 7px, labels 11.5px, and the copy control stays muted until hovered; an earlier 70% opacity version measured 3.91:1 on the live site and was removed.
- **Light theme.** Warm paper `#f5f2ea`, ink `#1a1a1a`, muted `#5f5c55`, accent `#b03a0e`; accent contrast 5.43:1 on the page and 4.92:1 on panels.
- **Motion.** Navigation links animate an underline in on hover and settle in accent on the current page; the table-of-contents marker fades in; both use the shared 120 to 160ms easing and are disabled under reduced motion.

Checks after the pass: 0 diagnostics, 10 tests, 20 of 20 overflow combinations clean, accessibility audit 0 violations in both themes.

## Deployment

Deployed to Vercel on October 16, 2026 at https://blog-mesh-nu.vercel.app (project `blog-mesh`, GitHub repository connected for automatic deployments, `SITE_URL` set in production). Live checks: every page, the feed, sitemap, search index, Pagefind bundle, and the 404 page respond correctly; canonical URLs, sitemap locations, and feed links use the production origin; the editor route is served by the Vercel function and shows its GitHub login. Lighthouse over the network: homepage 100 in all four categories with LCP 1.0 s; article 99 performance, 100 best practices and SEO. Still owner-only: the Keystatic GitHub App credentials, the deploy hook secret for scheduled publishing, giscus ids, a custom domain, and real About copy.

## Layout and surface pass

The owner found the left-aligned column wrong on wide screens and the solid title fill gimmicky, and asked for a pass over backgrounds and details. Changes: the reading column is centered at 720px with equal margins; from 1180px the article page becomes a three-column grid whose outer tracks are equal, so the table of contents sits in the right margin while the text stays aligned with the header. The hover fill became a shared underline that draws in from the left, used by titles, navigation, and the "Read next" card. A surface system replaced flat panels: code windows, blockquotes, the outcome explorer, the search chips, the related-post card, and keyboard hints sit on an elevated surface in both themes, and the header, footer, feed entries, article header, and article end are separated by hairlines. Filters are chips with a surface state. Verified: equal margins at 1280 and 1440, 25 of 25 overflow combinations clean, accessibility audit 0 violations; captures in `artifacts/restyle-2026-10-16/`.

## Studio layout

The owner judged the overall style and layout not good enough and asked for a creative rework including fonts. This round changed the composition rather than the details: a sticky left rail (identity, focus line, navigation, search, theme, site links) with a wide stage for content; a composed homepage with a statement headline, a featured card with an accent glow, a card grid, and a notes panel; date-column rows on archive pages; a 720px article measure with a side table of contents from 1360px. Type moved to Schibsted Grotesk, Instrument Sans, and JetBrains Mono. Surfaces gained a hairline border and inner highlight; the page has a soft accent glow at the top; hover is a drawn underline plus a two-pixel lift on cards. Below 1024px the rail collapses to a top bar, and under 440px navigation wraps to a second row, which fixed an overflow at 320px found during verification. Checks: 30 of 30 overflow combinations clean from 320 to 1440, accessibility audit 0 violations on five pages, tests and diagnostics clean. Captures in `artifacts/studio-2026-10-16/`.

## Prototype first, then Folio

The owner rejected the studio layout as well and asked for a different process: prototypes first, designed without referencing existing sites, implementation only after approval. Three complete static mockups were built in `artifacts/prototypes-2026-10-16/` with the real titles and code sample: Folio (light, book-like numbered index, IBM Plex, deep green), Nocturne (dark, atmospheric, featured card and outlined year), and Ledger (light workspace with sidebar and a ledger table). The owner approved Folio.

Implementation follows the prototype: a centered 760px column; header with name and focus line on the left and a text navigation on the right; a large headline over a one-pixel ink rule; the homepage as a numbered table of contents with mono numerals in green; notes as a plain list; archive rows under year labels with pill filters; article pages at a 66-character measure with the table of contents hanging in the right margin from 1280px; code always in a dark panel with the Shiki dark colors in both themes; light default with a dark variant behind the toggle. IBM Plex Sans and IBM Plex Mono through Astro's font API. The rail, cards, surfaces, and glow from the previous round were removed.

Verification: diagnostics and tests clean; 30 of 30 overflow combinations clean from 320 to 1440 after two fixes found by the matrix (the header wraps under 400px; the side contents needs 1280px, not 1180px); accessibility audit 0 violations on five pages in light and three in dark. Captures in `artifacts/folio-2026-10-16/`.

## Craft pass on Folio

The owner asked for further detail work and creative elements, with the direction agreed before code. Approved: a detail pass, index-to-article continuity, a reading line, and the entry numeral on articles; the identity items were left to my judgment and I chose the colophon footer, generated social cards, and a new mark, leaving chapter-style year numerals out because the entry numeral already carries that idea.

What changed: Astro's client router with view-transition names on titles, so the clicked title morphs into the article headline; scripts now register through `src/scripts/page.ts` and bind window-level listeners with a per-page abort signal, the search shortcut is bound once for the session, and the theme is re-applied after each swap. A fixed two-pixel reading line fills across the top of articles. The article header shows its index numeral at 128px in the hairline color on wide screens and inline in the crumb below 900px. Index rows swap the numeral for an arrow on hover and focus. The header gained a green mark that turns on hover and a search entry with its ⌘K hint; the footer became a colophon; the 404 page is entry 00. Social cards are rendered at build time with Satori and resvg from the Fontsource Plex WOFF files, one per post plus a site card, and every page declares them for Open Graph and Twitter. The favicon is the new mark.

Verification: diagnostics and tests clean (the test runner required explicit `.ts` extensions on the new imports); client-side navigation checked in the browser for theme persistence, shortcut, contents tracking, and the reading line; 36 of 36 overflow combinations clean from 320 to 1440 after restoring the header wrap under 400px; accessibility audit 0 violations in both themes; link check 183 references.

## The annotated edition

The owner asked for deeper article detail, a code component redesigned from scratch, and motion with purpose, with the direction agreed first. The direction was written up and a static prototype of the article page (`artifacts/prototypes-2026-10-16/src/folio-article-v2.html`, captures `folio-v2-*.png`) was approved before implementation.

Code component: the Shiki transformer in `src/lib/code-meta.ts` now reads `title`, `{lines}`, `note`, `caption`, and `wrap`; it marks the line count and gutter, inserts the note as a grid row under the last highlighted line, and wraps captioned blocks in a figure, so gutter, highlights, notes, and captions exist in the HTML without JavaScript. The client script builds the editor-style tab, a wrap control shown only when a line overflows, a copy control with an icon that turns into a check and flashes the lines, and folding for blocks over 24 lines. Copy joins the `.line` elements so notes are never copied; the feed sanitizer drops the notes too.

Typography: section headings carry CSS-counter numerals mirrored by the contents list; quotes have glyphs and a citation style; external links end with an arrow; an `Aside` component exists for MDX and as a Keystatic wrapper block; the source citation is a two-row definition list.

Motion: the theme toggle runs a circular ink wipe through the View Transitions API with a class scoped so Astro's page transitions are untouched; the contents marker slides between entries via custom properties set by the script; the search dialog uses `@starting-style`; a back-to-top control appears after a screen of scrolling; the diagram's connector lines thicken toward the selected outcome and dim elsewhere. Reduced motion disables all of it.

Verification: 11 tests pass; the built article contains the gutter attributes, the note row, and the figure caption; the feed excludes the note; headings and contents numbering, source rows, and the external-link mark checked in the browser; the theme wipe runs and cleans up its class; the search dialog is mid-transition on open; the diagram state attributes drive the connector styles; 36 of 36 overflow combinations clean; accessibility audit 0 violations; link check 194 references. Clipboard writes are refused in the headless browser, so copy was verified through its selection fallback.

## The mark

The owner asked whether a logo icon had been considered. The existing mark was a placeholder: a green rounded square with a paper dot, consistent with the palette but carrying no idea. Three candidates were rendered side by side at 48px, in both themes, at 32 and 16px, and in the header lockup (`artifacts/prototypes-2026-10-16/marks.png`): a lowercase Plex-style monogram, a page with a turned corner, and an index glyph of a numeral stroke beside two entry lines. The owner approved the page.

Implementation: the geometry lives once in `src/lib/mark.ts` and is drawn as a 48-unit box with a green tile, a paper page, a half-transparent paper flap for the turned corner so it reads in both themes, and two text lines. `/favicon.svg` and `/apple-touch-icon.png` are build-time endpoints from that source, the latter rendered square because iOS masks its own corners. The header renders the mark inline through `Mark.astro` so it follows the theme tokens; on hover the flap scales from the page corner and the lines settle, as if the page were being opened. Social cards use the same mark at 40px in place of the former square when no numeral applies.

Found during verification: the social cards had never shown their footer row with the name and rule, because Satori sizes the root box as content-box and the padding pushed the canvas to 1360 by 766 before cropping to 1200 by 630. Setting `boxSizing: 'border-box'` on the root fixed every card.

## The wind in the margins

The owner asked whether the character-wind background from egoist/mygo's `examples/wind` could be adapted for the blog, pointing to a WebGL2 port already made in the Motion Lab project. The assessment was that a full-page animated field would fight Folio's reading surface, so the design work was to make it belong: the reading column is calm (a column rule replaces the original's calm card, fading in over 160px into the margins), glyph ink is the muted token, ripples glow in the accent green instead of blue, and the atlas is drawn from IBM Plex Mono. A prototype of the homepage (`artifacts/prototypes-2026-10-16/src/wind-folio.html`, captures `wind-folio-*.png`) was shown; the owner left placement to me and I chose index pages only, keeping articles still.

Implementation: `src/scripts/wind-shaders.ts` and `src/scripts/wind.ts` (a class with the field and glyph passes, pointer warmth, click ripples, rest after three minutes, 30 frames a second at rest and 60 during a ripple, a four-million-pixel cap, context-loss handling); `Wind.astro` renders the canvas behind the page, persists it across client-side navigations between index pages, and loads the renderer lazily after idle only when `(min-width: 900px) and (hover: hover) and (prefers-reduced-motion: no-preference)` matches, unmounting when it stops matching. The paper background moved from `body` to `html` so the canvas sits between them. The MIT notice is served at `/third-party-notices.txt` and the colophon credits MyGo.

Verification: checks, 11 tests, build, and link check pass; the wind chunk is 19 KB minified and loads only on qualifying pages; in the built site the renderer is active on the home and Writing pages, absent on articles, resumes after navigating away and back, follows the theme toggle, and hides below 900px and returns above it (a first version lost the WebGL context on unmount, which left a reused canvas unusable; GPU objects are now released instead); no horizontal overflow from 320 to 1280; console clean.

### One surface, not two strips

The owner judged the first version split down the middle: the column mask went to zero over a short fade, so the field was two strips and a ripple died at the column edge. Three maskings were rendered side by side on the prototype with the same click at the page center (`artifacts/prototypes-2026-10-16/wind-mask-*.png`, `?mode=split|soft|head`): the shipped split, a soft version with a 30 percent floor behind the column, and a head version where the field is strongest around the page head, the column mask lifts most of the way there, and the whole field settles to about a third below the ink rule. In all but the split version the pointer's ripples and warmth override the masks, so the surface stays one piece under interaction. The owner left the choice to me; the head version shipped because it gives the page a hierarchy, opening in weather and quieting as reading begins. The renderer reads the page head from `.hero` or `.page-head` and the column from `.wrap`, both refreshed after each client-side navigation. Verified on the home, Writing, and 404 pages in both themes (`artifacts/folio-2026-10-16/v5-wind-*.png`).

## The quieter edition

The owner raised three problems: the mark was not good, the homepage rows showed too much, and the article page repeated itself and felt cluttered, with the faint entry numeral squeezing titles into three lines. They pointed to stephango.com for inspiration. The lesson taken from it was economy rather than appearance: one column, one small scale of sizes, each fact shown once. A prototype (`artifacts/prototypes-2026-10-16/src/folio-v3.html`, captures `folio-v3-*.png`) was approved.

What changed: the numbering conceit is gone everywhere (index numerals, the large faint entry numeral, section numerals, numbered contents, entry 00, numbered social cards). The homepage is a 40px statement, a "Latest" block with the newest article and its one-line description, then "Writing" and "Notes" as year-month and title rows; the description appears once. Archive pages are the same rows under a plain title, the Writing page keeping its topic filters. The article head is the title at 34px across the full column, one meta line (date, reading time, topic link, format), and for reading notes one source sentence; the lede, tag chips, back links, and the duplicate description on "Read next" are gone; section headings are 23px without numerals and the contents list is unnumbered. The header is the name alone, with "/ Writing" or "/ Notes" as a crumb on article pages; the page-with-a-fold mark was dropped because it read as a generic documents icon, and the tab icon is now a plain M on the green tile, drawn from `src/lib/mark.ts` for the favicon, touch icon, and social cards. The column narrowed from 760 to 720px.

Verification: checks, 11 tests, build, and link check pass; captures of the home, Writing, article (top, end, dark), 404, and phone views in `artifacts/folio-2026-10-16/v6-*.png`; no horizontal overflow at 320, 375, 600, or 900; console clean.

### The drawn icon

The owner asked for a mark in the spirit of stephango.com's icon, which is a hand-drawn smiling face in a few brush strokes on a pale disc, used only for the tab and touch icon while the header stays text. Three drawn candidates were rendered large, in a tab at 16px, at 32px, on the dark theme, and beside the name (`artifacts/prototypes-2026-10-16/marks-drawn.png`): a face in profile, the initial written in one loose stroke, and a thought loop ending in a green dot. The profile read as a curly brace at tab size and the loop as an eye, so the drawn m was recommended and the owner approved it as the icon only. It is three uneven arches of ink on a pale paper disc, drawn in `src/lib/mark.ts` and served as the favicon, the touch icon (on a paper square, since iOS keeps no transparency), and the device on social cards. No green, so the accent stays reserved for links and the wind's ripples.

## Markdown blocks

The owner asked whether Markdown rendering should be optimized, naming macOS window styling for code, media previews, and "graph prompts". The direction prototype (`artifacts/prototypes-2026-10-16/src/markdown-blocks.html`, captures `markdown-blocks-*.png`) gave each candidate a verdict: figures and video, a terminal fence, build-time diagrams, prompt transcripts, footnotes, heading anchors, and math were approved; link preview cards wait; macOS traffic lights were shown beside the existing editor tab and declined as decoration that says nothing about the code.

Implementation: `src/lib/figures.ts` (rehype, plain Markdown) and `Figure.astro` (the `img` override for MDX) turn an image with alt text into a captioned, optimized, lazy figure whose link the `Lightbox.astro` dialog takes over with a view-transition morph; `Video.astro` plays silent demos while on screen, never under reduced motion. The `terminal` fence meta in `src/lib/code-meta.ts` marks commands and output by their prompt and `code-windows.ts` copies only the commands. `src/lib/diagrams.ts` renders ```dot fences with Graphviz compiled to WebAssembly, inserts Folio's defaults, strips the fixed size and tooltips, and maps literal colors to theme tokens as inline styles so diagrams follow the theme; `syntaxHighlight.excludeLangs` keeps Shiki off them. `Transcript.astro` and `Turn.astro` quote conversations with folding and copy-the-prompt. Footnotes, `rehype-slug` with `rehype-autolink-headings`, and `remark-math` with `rehype-katex` in MathML output (no stylesheet, no fonts) round it out. All blocks are also Keystatic components. Astro 7 only runs unified plugins when `@astrojs/markdown-remark` is installed, so it was added.

Verification: 16 tests pass (new: diagram styling and theming, figure wrapping, terminal prompts); the built fixture (`writing-blocks.mdx`, kept as a draft) contains one figure per image after a first version nested two, prompt spans, a themed SVG, MathML, footnotes, and anchors; in the browser the lightbox opens and closes, the ambient video plays in view and pauses out of view, the transcript folds at phone width and labels model turns, the diagram follows the dark theme, and nothing overflows at 375.

### The window bar

After the blocks shipped, the owner said plainly that the macOS window styling for code was something they needed, not an option I could decline. The code bar is now a macOS title bar: three traffic lights on the left (decorative, hidden from assistive technology), the filename or language centered, wrap and copy on the right, with a slightly lighter bar than the panel. The green underline under filenames went with the tab metaphor. The terminal fence shares the same bar.

## Type pass and sign-off

The owner delegated the remaining refinement with one requirement: the typography needed attention and the right fonts, with the files shipped by the site. An audit of every page at 1440 and 390 wide (`artifacts/audit-2026-10-17/`) found: the heading anchor's text leaking into the contents list ("#What the article says") and the hidden footnotes heading appearing there; headings indented on phones by the invisible anchor; meta separators in the hairline color; reading time wrapping mid-phrase; display math flush left; an unlabeled footnote list; the newest article repeated in the Latest block and the rows; and faint terminal output. All were fixed: the anchor has empty content and a CSS-drawn mark, the contents list filters the footnotes heading, anchors are hidden below 540px, separators are muted, meta items are unbreakable spans, math is centered and larger, the footnotes heading shows as a small label, the rows start after the newest article under "Earlier writing", and terminal output is brighter.

Type: IBM Plex gave way to one family in three faces, Source Serif 4 for reading text (18px on 1.65), Source Sans 3 for headings and the interface, Source Code Pro for code and metadata. Astro's Fontsource provider downloads and self-hosts the files at build time (14 Latin files, about 240 KB in total, serif body and sans heading preloaded); the social cards read the same families from the `@fontsource` packages, and the wind's glyph atlas uses Source Code Pro. The article title is 36px, section headings 24px. Verified: all three families load, the contents list is clean, phone headings align with the body, no overflow at 390, checks and 16 tests pass.

### Feed and the sample page

A check of the feed after the new blocks found that readers got doubled math text (the MathML and its TeX source), empty heading anchors, root-relative image and video URLs, a bare caption where each diagram had been, and no label on model turns. `src/lib/feed-html.ts` now rewrites math to its TeX source in code, replaces each diagram with a pointer to the article, drops the anchors, and makes media and links absolute against the site URL; the sanitizer admits video with controls and strips the copy buttons; model turns render "Model" server-side and the script swaps in the transcript's model name. The fixture article was published as "How this site renders things", an honest tour of the blocks, so readers can discover them.

### The contents list that scrolled away

The owner reported that the side contents list looked like a dummy: it did not update and scrolled out of view. The tracking script was working, but the list was positioned absolutely at the top of the article, which overrode the sticky rule, so the highlight changed where no one could see it. The nav now spans the article's height and a sticky block inside it follows the reader; the last section is marked current at the end of the page even when its heading never reaches the top.
