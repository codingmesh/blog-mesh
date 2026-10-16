# Blog Mesh acceptance review and refinement log

Date: October 14, 2026 (America/Los_Angeles). Target: the local Astro static build at http://127.0.0.1:4321/.

Translated into US English on October 15, 2026. This is a historical record of that review, not a claim that the original screenshots show the current English site. Screenshots remain unmodified source evidence.

## Outcome

This round reviewed and refined the main pages, reading flow, themes, search, and failure states. It retained the initial warm-white, green, editorial direction while improving reading, touch interaction, and recovery.

- Five page types at 320, 375, 768, and 1280px produced 20 layout combinations with no horizontal overflow in the page or key text.
- After fixes, axe-core 4.14.0 checked 17 page, theme, and dialog states with no confirmed violations. The rules included WCAG 2 A/AA, 2.1 AA, 2.2 AA, and best practices.
- Astro and TypeScript reported 0 errors, 0 warnings, and 0 hints. The static build succeeded.
- The publication-boundary regression test passed for drafts and future-dated content.
- All ten generated pages passed checks for a unique H1, page title, internal links, and heading anchors. RSS and the fallback search index each contained five published entries.
- A genuinely missing route returned HTTP 404 with the custom recovery page. The 404 page was excluded from the sitemap and marked noindex.

These results cover local browser checks and automated rules, not a complete accessibility certification. They do not cover physical mobile devices, a full VoiceOver workflow, every browser, or public Core Web Vitals. Simulated request blocking, print media, reduced motion, and viewport overrides were restored after testing.

## Review steps

| Step | Page or flow | Work completed | Status and evidence |
|---|---|---|---|
| 1 | Homepage discovery | Improved supporting text, balanced short headings, limited recent articles to five, and derived source names from content | Passed; screenshots 10 and 15, four-size layout data |
| 2 | Archive and topic filtering | Preserved URL state and back navigation; prevented duplicate history entries; added an explicit unknown-topic state and recovery action | Passed; screenshot 18 and live recovery checks |
| 3 | Article and code reading | Set mobile body text to 17px; added high-contrast syntax themes, copy feedback with manual selection fallback, keyboard scrolling, active contents navigation, and same-type recommendations | Passed; screenshots 08 and 17; copied text matched the original code |
| 4 | Full-text search | Added topic suggestions, match highlighting, arrow-key navigation, Escape dismissal, restored focus, IME composition handling, and stale-request protection | Passed; screenshots 11 and 12; keyboard and rapid-input checks |
| 5 | Search recovery | Used a title/summary/topic index when full-text search failed; provided retry and archive links when both indexes failed | Passed; screenshots 13 and 14; retry succeeded after restoring blocked requests |
| 6 | Notes, About, and 404 | Unified text sizing, anchored the footer on short pages, and provided two clear 404 recovery paths | Passed; screenshots 19, 20, and 21 |
| 7 | Themes, keyboard access, and output | Used 44×44 mobile targets, skip navigation, system-theme tracking without a stored preference, reduced-motion behavior, and print-friendly code | Passed; DOM geometry, focus, and media-emulation checks |

## Specific fixes

### Reading and typography

- Orange tokens in the default GitHub light syntax theme had approximately **3.48:1** contrast against white. High-contrast themes replaced it; rescans of light and dark articles reported no confirmed violations.
- Introductions, summaries, and mobile dates were too small. Sizes increased while preserving hierarchy; mobile body text was standardized at 17px.
- Narrow article titles sometimes left one or two characters on the last line. Balanced wrapping improved short headings while preserving natural breaks.
- A fixed-canvas state diagram became hard to read on phones. It was replaced by semantic HTML with three desktop columns and vertical mobile branches.
- CSS precedence was corrected so desktop padding did not override the diagram's mobile indentation and connectors.
- External-link indicators no longer wrapped onto a separate line. New-tab behavior received an accessible description.
- Short pages gained a stable footer position instead of leaving the footer partway down the content area.

### Interaction and recovery

- Mobile navigation, search, and theme controls use 44×44 CSS px targets.
- Copy controls provide a transition from “Copy code” to “Copied.” If copying fails, the code is selected and manual-copy instructions are announced. Copied content was verified against the original.
- Long code blocks can receive keyboard focus and scroll horizontally without clipping their focus indicator.
- Search starts with real topic suggestions, highlights matches, and avoids repeating a title in its excerpt.
- Results retain ordinary-link semantics for Tab, Enter, and modifier-click. Arrow keys move between the input and results.
- Closing the dialog restores focus to its trigger. Background scrolling is locked, and dialog height respects the dynamic viewport.
- Empty results offer suggested topics and an archive link. Loading failures offer retry rather than pretending there were no results.
- An unavailable full-text index falls back to a lightweight index; development mode can search titles, summaries, and tags.
- Clearing input, closing the dialog, and composing text with an IME have separate handling to prevent stale results and unnecessary requests.
- An unknown topic keeps an explicit empty state instead of silently showing every article.
- Related content prioritizes the same content type rather than cycling indiscriminately through articles and short notes.

### Maintenance and sharing

- Homepage source labels come from content metadata, with at most five recent articles.
- Article metadata includes publication date and author.
- The 404 page uses noindex and is excluded from the sitemap.
- Printing hides navigation and reading controls and uses black text on white, including when the active screen theme is dark.
- Reduced-motion preferences disable smooth scrolling and control transitions.

## Automated checks requiring interpretation

- For the closed native dialog, axe could not automatically determine whether the trigger's `aria-controls` target existed. The `search-dialog` element was present in the DOM, and opening, closing, and focus restoration were tested.
- Some clipped search excerpts and arrow-key symbols could not be assessed automatically for contrast. Reading the final styles gave approximately 7.48:1 for ordinary dark-dialog text and 13.32:1 for headings. Highlighted text uses separate semantic colors. The symbols are hints, not the only way to operate search.
- A full screen-reader review was not performed. Automated results are not described as complete WCAG compliance.

## Screenshots

These are the actual captures from the review and were opened for inspection. Complete files are in `artifacts/acceptance/`, outside the public build. The original interface language is preserved in the pixels.

### Homepage, light and dark

![Refined homepage](/Users/mikey/Projects/personal/blog-mesh/artifacts/acceptance/10-home-desktop-after.jpg)

![Refined dark homepage](/Users/mikey/Projects/personal/blog-mesh/artifacts/acceptance/15-home-dark-after.jpg)

### Search results and keyboard focus

![Search highlighting and focus](/Users/mikey/Projects/personal/blog-mesh/artifacts/acceptance/11-search-after.jpg)

### Empty results, fallback, and total failure

![Empty search state](/Users/mikey/Projects/personal/blog-mesh/artifacts/acceptance/12-search-empty-after.jpg)

![Fallback search](/Users/mikey/Projects/personal/blog-mesh/artifacts/acceptance/13-search-fallback.jpg)

![Search recovery](/Users/mikey/Projects/personal/blog-mesh/artifacts/acceptance/14-search-error.jpg)

### Mobile code and diagram

![Mobile code](/Users/mikey/Projects/personal/blog-mesh/artifacts/acceptance/08-code-mobile-after.jpg)

![Responsive state diagram](/Users/mikey/Projects/personal/blog-mesh/artifacts/acceptance/17-mobile-diagram-after.jpg)

### Archive, Notes, About, and 404

![Writing archive](/Users/mikey/Projects/personal/blog-mesh/artifacts/acceptance/18-archive-after.jpg)

![Notes page](/Users/mikey/Projects/personal/blog-mesh/artifacts/acceptance/19-notes-after.jpg)

![About page](/Users/mikey/Projects/personal/blog-mesh/artifacts/acceptance/20-about-after.jpg)

![404 page](/Users/mikey/Projects/personal/blog-mesh/artifacts/acceptance/21-404-after.jpg)

## Data records

- [Layout matrix JSON](/Users/mikey/Projects/personal/blog-mesh/artifacts/acceptance/layout-matrix.json). Historical heading labels were translated for readability; the records explicitly identify translated labels, and geometry is unchanged.
- [Post-fix accessibility results](/Users/mikey/Projects/personal/blog-mesh/artifacts/acceptance/axe-results.json)
- [Original code-contrast finding](/Users/mikey/Projects/personal/blog-mesh/artifacts/acceptance/axe-article-mobile.json)

## Remaining publication requirements

At the time of review the site was a local preview. A real domain had not been configured, so canonical URLs, RSS, and the sitemap used the local address. Deployment requires `SITE_URL`. The biography and initial articles remain labeled sample material requiring the owner's review before publication under their name. Public loading performance and physical-device behavior should be checked after deployment.
