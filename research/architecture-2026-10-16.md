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
