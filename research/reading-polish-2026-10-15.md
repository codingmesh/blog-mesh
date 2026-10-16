# Reading hierarchy refinement log

Date: October 15, 2026. This round implemented the specific findings from the second comparison while retaining the technical-blog direction and macOS-style code windows.

This document is now in US English. The measurements describe the original pre-localization interface, and screenshot pixels remain unchanged historical evidence. Labels and queries mentioned below are translated descriptions of the original checks.

## Changes

1. Homepage article titles align with the left edge of the 760px column. Dates moved from a standalone column into metadata after the summary. The archive retains year grouping and aligned dates.
2. The homepage introduction became more compact. The name decreased from 32px to 28px, and article titles increased from 19px to 20px, with separate mobile rules.
3. The article back link and topic share a row. Header spacing was reduced, and the source card became a compact citation that retains the full link, author, and domain.
4. Collapsed contents navigation keeps a 44px target with less surrounding spacing. The first body heading no longer adds unnecessary top margin.
5. The content model gained `format: essay | reading`. Topics remain in `tags`; the three reading articles moved their reading-note classification into `format`. Short notes, articles, and reading notes display appropriate labels.
6. The fallback index retains content format, so a reading-note query can still find the relevant entries. Topic suggestions and archive filters use only topics.
7. No biography, experience, or projects were invented.

## Measurements at matching viewport sizes

| Metric | Before | After |
|---|---:|---:|
| First mobile body content, 375×812 | About 721px | About 539px |
| Source area height, same article | About 115px | About 52px |
| Collapsed mobile contents height | 54px | 46px |
| Mobile body size | 17px | 17px |
| Desktop introduction height, 1280×720 | 202px | 172px |
| First desktop article title position | 349px | 316px |
| Separate homepage date column and gap | 118px | Removed; date moved into metadata |

The mobile measurements used the article whose English title is “Reliable automation starts with visible failures.” Other articles grow naturally with title, summary, and source length. These are DOM measurements, not a reading-speed experiment.

## Validation

- Astro and TypeScript: 0 errors, 0 warnings, and 0 hints. The production build succeeded.
- The homepage, sample article, and article with a long English source title had no horizontal overflow at 320, 375, 768, or 1280px.
- Mobile contents expansion and heading navigation worked.
- Topic filters contained only All, Agent Engineering, Context Engineering, and Development Practice. Selecting Context Engineering returned one article.
- With Pagefind blocked, the fallback returned three articles for the reading-note query. Network settings were restored afterward.
- Automated checks of the new homepage and mobile article reported no confirmed violations. The tool still could not determine the hidden dialog's aria-controls relationship automatically; this was not presented as full accessibility compliance.
- No redundant copy or styling tests were added. Code windows, theme controls, and publication-boundary logic remained unchanged.

## Results

![Refined homepage](/Users/mikey/Projects/personal/blog-mesh/artifacts/reading-polish-2026-10-15/home-desktop.jpg)

![Refined mobile article](/Users/mikey/Projects/personal/blog-mesh/artifacts/reading-polish-2026-10-15/article-mobile.jpg)

[Homepage measurements](/Users/mikey/Projects/personal/blog-mesh/artifacts/reading-polish-2026-10-15/home-metrics.json) / [Mobile article measurements](/Users/mikey/Projects/personal/blog-mesh/artifacts/reading-polish-2026-10-15/article-metrics.json) / [Responsive checks](/Users/mikey/Projects/personal/blog-mesh/artifacts/reading-polish-2026-10-15/layout-check.json)
