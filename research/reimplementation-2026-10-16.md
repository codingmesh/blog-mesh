# Reimplementation against the documented requirements

Date: October 16, 2026. This round analyzed the existing design and implementation, then reimplemented the parts that fell short of the requirements recorded in `AGENTS.md`, `README.md`, and the earlier research notes. The writing-first direction, the reading hierarchy from the October 15 refinement, and the macOS-style code windows were kept, as the second comparison recommended.

## Analysis

The baseline passed every existing check: the US English guard, Astro and TypeScript diagnostics, the publication-boundary test, and the production build. The visual state matched the October 15 record. The gaps were in consistency and maintenance rather than in the reading experience:

- The site configuration defined a tagline that no page used. The homepage, footer, About page, and layout each carried their own copy, and the owner's name was hardcoded in three places in the layout.
- Theme colors were repeated in the stylesheet, the head script, and the toggle script.
- One component, one icon, and two CSS classes were unused, and the collapsed contents navigation rules were duplicated across two breakpoints.
- The label logic for notes, reading notes, and articles was duplicated between the article page and the fallback search index.
- On phones, the Featured label wrapped onto its own line beneath the first homepage entry.
- The second comparison asked for filenames and line highlighting in code windows once an article needed them. The sample article's type sketch refers to a specific part of the code, so it is a legitimate first use.
- The author-identity requirement from the second comparison remained open. It needs facts from the owner and was not invented.

## Changes

1. `src/config.ts` now holds the name, wordmark, tagline, focus line, and theme colors. The header, footer, homepage, and About page read from it. Supplying real identity details is a single edit plus the About prose.
2. The theme-color meta tag carries both colors as data attributes. The head script and the toggle script read from it instead of repeating hex values, and the toggle script uses one `applyTheme` function.
3. A `formatLabel` helper in `src/lib/content.ts` is shared by the article page and the fallback search index.
4. A local Shiki transformer in `src/lib/code-meta.ts` reads fence metadata. `title="..."` names the code window; `{2,5-7}` highlights lines. No new dependency was added. The highlight spans the full scrollable width, works in both themes, and does not change copied text.
5. The sample article highlights the three union members its text describes. No filename was invented for a type sketch.
6. Metadata rows use a small row gap so a wrapped line stays attached, and phones use a tighter column gap. The Featured label now fits on one line at 375px.
7. A shared `--column` token replaces four copies of the reading-column width. Dead selectors, the unused component and icon, and duplicated breakpoint rules were removed.
8. A focused test covers the fence-metadata parser, including malformed ranges.

## Measurements

Same pages and viewports as the October 15 record. Values were taken from the DOM in a headless browser.

| Metric | October 15 record | After this round |
|---|---:|---:|
| Desktop introduction height, 1280×720 | 172px | 172px |
| First desktop article title position | 316px | 316px |
| Article titles visible on the desktop first screen | 3 | 3 |
| Mobile body size, 375×812 | 17px | 17px |
| Source citation height, same article | About 52px | About 52px |
| Collapsed mobile contents height | 46px | 46px |
| Featured label rows on the phone homepage | 2 | 1 |
| Highlighted lines in the sample article | 0 | 3, spanning the full code width |

The first mobile heading sits at about 498px and the first body item at about 555px. That is unchanged from the baseline captured before this round's edits; the English title wraps to two lines, which the October 15 Chinese-interface measurement did not include.

## Validation

- US English guard, Astro check, and TypeScript: 0 errors, 0 warnings, 0 hints. Production build succeeded with five indexed pages.
- Three unit tests pass: publication boundaries and two for fence metadata.
- Five page types at 320, 375, 768, and 1280px: 20 combinations without horizontal overflow.
- Theme toggle: the document theme, stored preference, button label, and meta theme color all update from one function. The stored preference was cleared after the check.
- Dark theme: code background and highlight tint remain distinct; the dark override no longer forces a background onto every token span.
- Not covered: physical devices, a full screen-reader pass, and public deployment. Automated accessibility scans were not rerun because no interactive structure changed; the earlier results still describe the dialog, navigation, and focus behavior.

## Still open

- Author identity. The tagline, focus line, and About prose are preview copy until the owner supplies real focus areas, projects, or an editorial statement. The About page keeps its preview disclosure.
- `SITE_URL` must be set before deployment, as before.

## Results

![Homepage, desktop](/Users/mikey/Projects/personal/blog-mesh/artifacts/reimplementation-2026-10-16/home-desktop.jpg)

![Homepage, phone](/Users/mikey/Projects/personal/blog-mesh/artifacts/reimplementation-2026-10-16/home-mobile.jpg)

![Code window with highlighted lines, light](/Users/mikey/Projects/personal/blog-mesh/artifacts/reimplementation-2026-10-16/code-light.jpg)

![Code window with highlighted lines, dark](/Users/mikey/Projects/personal/blog-mesh/artifacts/reimplementation-2026-10-16/code-dark.jpg)

![Code window, phone](/Users/mikey/Projects/personal/blog-mesh/artifacts/reimplementation-2026-10-16/code-mobile.jpg)

[Homepage measurements](/Users/mikey/Projects/personal/blog-mesh/artifacts/reimplementation-2026-10-16/home-metrics.json) / [Mobile article measurements](/Users/mikey/Projects/personal/blog-mesh/artifacts/reimplementation-2026-10-16/article-metrics.json) / [Code window check](/Users/mikey/Projects/personal/blog-mesh/artifacts/reimplementation-2026-10-16/code-window-check.json)
