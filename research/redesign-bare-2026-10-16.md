# Bare redesign: titles carry the identity

Date: October 16, 2026. The owner reviewed the editorial redesign from earlier the same day and rejected it on four counts: too safe with no signature, too much apparatus, the wrong typography, and a dull palette. They asked for a full reinvention with the articles, routes, and navigation unchanged. This round replaces the visual system entirely.

## What was wrong with the previous version

Looking at the reference captures directly rather than through the notes made the gap obvious. Dan Abramov's site is remembered for one move: large colored titles on a dark ground and nothing else. Anthony Fu's is remembered for its signature mark and atmosphere. The editorial version had three fonts and a careful palette but no single move, and it surrounded the writing with hairlines, counts, labels, a source card, and an intro block. It read as a tasteful template.

## The concept

One idea, applied everywhere: **the article titles are the identity.** Everything else recedes.

- **Dark by default, one hot color.** Near-black background, warm off-white ink, coral accent. The system preference is not consulted; the toggle stores a choice of light, which uses the same system with the values swapped and a deeper accent for contrast.
- **No apparatus.** The homepage has no intro block. It is the feed: title, summary, date, reading time. No hairlines between entries, no tags, no counts, no featured label. Notes follow as a smaller list under a single mono label. Source citations are one mono line. Code windows are flat with one border.
- **One signature interaction.** Hovering or focusing a title fills it as a solid accent block with the background color as text, wrapping cleanly across lines. Inverted text keeps AA contrast in both themes.
- **Off-center column.** From 1100px up, the 680px column sits left and the right side stays empty, except on articles where the table of contents uses it.
- **Type.** Space Grotesk for titles and the wordmark, Hanken Grotesk for reading, JetBrains Mono for dates, filters, metadata, and code. All self-hosted variable fonts; a page loads about 125 KB of Latin subsets.
- **One radius, 4px.** Motion is limited to 100 to 120ms color transitions and is disabled under reduced motion.

Routes, navigation labels, the `mikey.` wordmark, search, the theme toggle, keyboard behavior, the code-fence title and highlight features, and all article content are unchanged. The `featured` field stays in the schema but is no longer displayed.

## Measurements

| Metric | Editorial version | This version |
|---|---:|---:|
| First article title position, 1280 wide | 340px | 116px |
| Article titles inside a 1280×720 first screen | 2 | 3 |
| Article titles inside a 1280×800 first screen | 3 | 3 |
| Phone body size, 375×812 | 17px | 17px |
| First phone body content, same article | About 590px | About 563px |
| Source citation height on the phone | About 75px | About 43px |
| Table of contents visible at 1280 wide | No | Yes |
| Navigation lines at desktop | 1 | 1 |

## Validation

- US English guard, Astro check, and TypeScript: 0 errors, 0 warnings, 0 hints. Production build succeeded with five indexed pages.
- Unit tests: 3 pass. No styling tests were added.
- Five page types at 320, 375, 768, and 1280px: 20 combinations without horizontal overflow.
- Browser accessibility audit on the homepage, archive, article, notes, and About in the dark default: 0 violations. Light-theme contrast was verified numerically from the token values.
- Theme toggle, stored preference, and meta theme color verified; the stored preference was cleared afterward.
- Not covered: physical devices, a full screen-reader pass, public performance measurements, and deployment.

## Results

![Homepage, dark default](/Users/mikey/Projects/personal/blog-mesh/artifacts/redesign-bare-2026-10-16/home-desktop.jpg)

![Title fill on focus](/Users/mikey/Projects/personal/blog-mesh/artifacts/redesign-bare-2026-10-16/home-title-focus.jpg)

![Homepage, light](/Users/mikey/Projects/personal/blog-mesh/artifacts/redesign-bare-2026-10-16/home-desktop-light.jpg)

![Archive](/Users/mikey/Projects/personal/blog-mesh/artifacts/redesign-bare-2026-10-16/archive-desktop.jpg)

![Article with table of contents](/Users/mikey/Projects/personal/blog-mesh/artifacts/redesign-bare-2026-10-16/article-desktop.jpg)

![Code window, dark](/Users/mikey/Projects/personal/blog-mesh/artifacts/redesign-bare-2026-10-16/code-dark.jpg)

![Code window, light](/Users/mikey/Projects/personal/blog-mesh/artifacts/redesign-bare-2026-10-16/code-light.jpg)

![Homepage, phone](/Users/mikey/Projects/personal/blog-mesh/artifacts/redesign-bare-2026-10-16/home-mobile.jpg)

![Article, phone](/Users/mikey/Projects/personal/blog-mesh/artifacts/redesign-bare-2026-10-16/article-mobile.jpg)

![Search](/Users/mikey/Projects/personal/blog-mesh/artifacts/redesign-bare-2026-10-16/search.jpg)

[Homepage measurements](/Users/mikey/Projects/personal/blog-mesh/artifacts/redesign-bare-2026-10-16/home-metrics.json) / [Phone article measurements](/Users/mikey/Projects/personal/blog-mesh/artifacts/redesign-bare-2026-10-16/article-metrics.json) / [Checks](/Users/mikey/Projects/personal/blog-mesh/artifacts/redesign-bare-2026-10-16/checks.json)

## Still open

- Author identity copy remains a labeled placeholder on the About page by the owner's choice. The homepage no longer shows a tagline, so nothing invented appears on the first screen.
- The project is not under version control and has no CI or deploy target. `SITE_URL` must be set before deployment.
