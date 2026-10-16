# Editorial redesign

Date: October 16, 2026. The owner asked for a visible redesign of the site with the article content kept as is and deployment out of scope. Three directions were offered; the owner chose the editorial, type-led direction. Routes, navigation labels, the `mikey.` wordmark, search, themes, keyboard behavior, and the macOS-style code windows were preserved.

## Design read

A personal technical blog for developer readers, redesigned in overhaul mode: new visual language, same content and information architecture. The previous site was clean but generic: system sans-serif, neutral gray, a small green accent, and a date column that read like a changelog. The goal was a distinctive reading identity without decoration for its own sake.

Settings used for the build: layout variance 5, motion 3 (hover and focus transitions only, no scroll effects), density 3.

## What changed

1. **Typography.** Three self-hosted variable fonts from Fontsource: Bricolage Grotesque for headings and interface labels, Source Serif 4 for body text and summaries, JetBrains Mono for dates, metadata, and code. A reading blog is a publication, which is the one case where a serif body earns its place; the sans display keeps headings from reading as literary. Latin subsets only are downloaded, about 130 KB across the three families, with the display and serif files preloaded.
2. **Palette.** Warm off-white paper and near-black ink with a single cobalt accent, and a matching dark theme. Every text color meets WCAG AA on every surface in both themes: muted text 5.97:1 light and 7.50:1 dark, accent 6.31:1 and 7.95:1.
3. **Homepage.** The newest article is set as a large lede with its summary in serif. Later entries hang their dates in the left margin beside the title. Notes are a compact list with dates on the right. Section headings are small and underlined rather than labels in uppercase.
4. **Archive.** Topic filters are text with an underline instead of pills. Each year is a large outlined numeral that hangs in the left margin on wide screens and sits above the list below 1200px.
5. **Article.** Display title up to 48px, serif lede, mono metadata, a 68-character measure for body text, and a cobalt rule on the source citation. The side table of contents and the collapsed phone version are unchanged in behavior.
6. **Shapes and motion.** One radius rule: 6px for controls, 10px for panels. Transitions are limited to color, underline, and a one-pixel press on buttons, and they are disabled under reduced motion.
7. **Everything else.** Notes page, About, 404, search dialog, footer, state diagram, and print styles were restyled on the same tokens. No icon set, route, or copy was changed.

## Measurements

| Metric | Before | After |
|---|---:|---:|
| Desktop introduction height, 1280 wide | 172px | 209px |
| First article title position, desktop | 316px | 340px |
| Article titles inside a 1280×800 first screen | 3 | 3 |
| Article titles inside a 1280×720 first screen | 3 | 2 |
| Phone body size, 375×812 | 17px | 17px |
| First phone body heading, same article | About 498px | About 540px |
| First phone body content | About 555px | About 590px |
| Navigation lines at desktop | 1 | 1 |

The lede is deliberately larger than the old uniform list, so the third title now sits just below a 720-pixel-tall desktop viewport. It remains inside the 800-pixel viewport that earlier rounds used as the desktop reference. The phone body start stays inside the 560 to 600 pixel target set in the second comparison.

## Validation

- US English guard, Astro check, and TypeScript: 0 errors, 0 warnings, 0 hints. Production build succeeded with five indexed pages.
- Unit tests: 3 pass. No tests were added for styling.
- Five page types at 320, 375, 768, and 1280px: 20 combinations without horizontal overflow.
- Accessibility audit through the browser CLI on the homepage, archive, article, and notes pages: 0 violations in the light theme. Dark-theme contrast was verified numerically from the token values. This is not a full screen-reader review.
- Theme toggle, stored preference, and meta theme color were verified after the color change. The stored preference was cleared afterward.
- Not covered: physical devices, public performance measurements, and deployment.

## Results

![Homepage, desktop](/Users/mikey/Projects/personal/blog-mesh/artifacts/redesign-editorial-2026-10-16/home-desktop.jpg)

![Homepage, dark](/Users/mikey/Projects/personal/blog-mesh/artifacts/redesign-editorial-2026-10-16/home-desktop-dark.jpg)

![Archive with year numeral](/Users/mikey/Projects/personal/blog-mesh/artifacts/redesign-editorial-2026-10-16/archive-desktop.jpg)

![Article, desktop](/Users/mikey/Projects/personal/blog-mesh/artifacts/redesign-editorial-2026-10-16/article-desktop.jpg)

![Code window, light](/Users/mikey/Projects/personal/blog-mesh/artifacts/redesign-editorial-2026-10-16/code-light.jpg)

![Code window, dark](/Users/mikey/Projects/personal/blog-mesh/artifacts/redesign-editorial-2026-10-16/code-dark.jpg)

![Homepage, phone](/Users/mikey/Projects/personal/blog-mesh/artifacts/redesign-editorial-2026-10-16/home-mobile.jpg)

![Article, phone](/Users/mikey/Projects/personal/blog-mesh/artifacts/redesign-editorial-2026-10-16/article-mobile.jpg)

![Search](/Users/mikey/Projects/personal/blog-mesh/artifacts/redesign-editorial-2026-10-16/search.jpg)

[Homepage measurements](/Users/mikey/Projects/personal/blog-mesh/artifacts/redesign-editorial-2026-10-16/home-metrics.json) / [Phone article measurements](/Users/mikey/Projects/personal/blog-mesh/artifacts/redesign-editorial-2026-10-16/article-metrics.json) / [Checks](/Users/mikey/Projects/personal/blog-mesh/artifacts/redesign-editorial-2026-10-16/checks.json)

## Still open

- Author identity copy remains the preview placeholder by the owner's choice. It is a one-file change in `src/config.ts` plus the About prose.
- `SITE_URL` must be set before deployment.
