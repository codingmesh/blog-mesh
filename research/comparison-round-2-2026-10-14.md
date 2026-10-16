# Second comparison: the direction is clearer, but reading hierarchy still needs work

Date: October 14, 2026. This round was analysis only; application code was not modified. It reused the initial reference screenshots at the user's request and captured fresh local pages and measurements.

Translated into US English on October 15, 2026. The findings and numbers describe the original interface before English localization. Screenshots remain unchanged historical evidence.

## Assessment

The direction fits a personal technical blog: system sans-serif text, neutral surfaces, a single article column, and a restrained accent. It is clearly different from the earlier literary personal homepage. The next round should preserve that direction and focus on reaching the body sooner, prioritizing homepage information, and expressing a real author identity.

This is not a ranking of technical ability or traffic. Dan emphasizes direct reading, Anthony presents a complete range of personal output, Josh emphasizes teaching, and Maggie emphasizes visual essays and growing knowledge. Combining every reference feature would not produce a coherent blog.

## Specific comparisons

| Reference | Strength visible in the captures | Current local implementation at the time | Decision to borrow |
|---|---|---|---|
| [Dan Abramov](https://overreacted.io/) | Articles appear directly, with titles as the primary visual focus | Direct lists exist, but the name is 32px and article titles are 19px; the introduction and date column retain substantial weight | Make article titles the first reading target and keep personal information brief |
| [Anthony Fu](https://antfu.me/posts) | Compact year-based archives with lightweight dates | Each article has a separate full-date column; all three dates match; rows are about 146–172px tall | Group archives by year, make dates secondary, and prioritize the title plus a useful introduction on the homepage |
| [Josh Comeau](https://www.joshwcomeau.com/) | Introductions, categories, and contents navigation support learning; illustration reinforces the educational identity | Code blocks and contents navigation work, but the content consists mainly of reading notes | Improve explanations and examples before using interaction count as a quality signal |
| [Maggie Appleton](https://maggieappleton.com/) | Essays and short notes use different presentations, with illustration tied to subject matter | Articles and notes are separated, but mostly by length and destination | Give content types stable meanings; use update dates or maturity labels only when they help |
| [Julia Evans](https://jvns.ca/) | Topic indexes make older writing discoverable | Three articles mix technical topics with “reading notes,” which is a content format | Distinguish topics from formats before expanding the index |
| [Simon Willison](https://simonwillison.net/) | Different entry points for frequent logs, links, and quotes; search supports retrieval | Search exists, but the content collection is small | Keep search useful without copying navigation designed for a much larger archive |

These are design judgments based on the earlier reference captures, not a new complete audit of those sites. Language, purpose, and content length differ, so first-screen item counts alone cannot establish quality.

## Measurements from this round

Desktop viewport: 1280×720.

- Main column: 760px.
- Introduction: 202px tall, excluding navigation.
- Name: 32px; article-list titles: 19px.
- Date column: 94px, with a 24px gap. Together they occupy 118px, approximately 15.5% of the main column.
- All three entries were dated October 14, 2026.
- The first title started at approximately 349px, the second at 495px, and the third at 666px.
- Row heights were approximately 146, 172, and 146px; summary wrapping affected height.

Mobile viewport: 375×812.

- Body text: 17px.
- Article title started at approximately 209px.
- The source card was approximately 115px tall; collapsed contents navigation was approximately 54px tall.
- The first body heading started around 664px, and the first body item around 721px.

These are DOM layout measurements, not experimental evidence of reading performance.

## Priority 1: the mobile body starts too late

The sequence is navigation, back link, category, title, summary, date and sample label, source card, contents control, and body heading. Each item has a purpose, but together they make the first screen mostly an introduction to the article.

Reduce spacing between the back link, category, and title. Compress the source into a compact two-line citation while keeping its link and author. Preserve expandable contents navigation with less surrounding whitespace. Keep the sample disclosure accurate, and do not shrink the 17px body text to create space.

Proposed acceptance target, not implemented during this analysis: on the same article at 375×812, body content should start around 560–600px. Longer titles and source names should still grow naturally.

## Priority 2: let titles take priority over dates

The standalone date column adds little information when three entries share the same date. Titles also begin to the right of the main column, making the eye cross the repeated dates before reaching the writing.

Align homepage titles with the main column. Put the date in a secondary metadata row near the title. The archive may retain aligned dates and year grouping. Each homepage entry needs a title, one useful introduction, and concise metadata.

The repeated dates are a fact of the sample content. They should not be replaced with invented dates just to make the layout look more natural.

## Priority 3: establish a real identity

The original tagline, translated as “Writing code and thinking things through,” conveys a personal tone but does not explain what the author studies over time. Anthony's identity combines a signature with real projects and activities. Maggie's illustrations relate to the subjects she writes about.

The next inputs should be a specific, truthful area of interest, an actual project, or a clear editorial focus. Without those inputs, do not invent a biography, projects, or firsthand experience. The current mikey. wordmark and green accent can stay.

## Priority 4: separate topics from formats

The filters mixed Agent Engineering, Context Engineering, and Development Practice with Reading Notes. The first three are topics; the last is a format. Because all three articles were reading notes, that filter effectively duplicated All.

Keep topic filters focused on subject matter and represent reading notes through a format field or small label. The distinction between articles and short notes should be documented and should not depend solely on word count.

## Code blocks: the visual treatment is established

The implementation already has macOS-style chrome, decorative traffic-light dots, a centered language name, a copy button, dual-theme highlighting, and mobile scrolling. Code is 14px on desktop and 13px on phones. That meets the visual target discussed for the component.

Window chrome does not by itself improve teaching. Add filenames for genuine multi-file examples, line highlighting when explaining specific statements, and optional wrapping for long commands only when the writing needs them. Not every reading note needs these features, and source code should not receive an invented command prompt.

## Keep these decisions

- Neutral light/dark surfaces with a restrained green accent.
- System sans-serif typography and the 17px body size used for the original Chinese interface.
- Simple navigation, themes, RSS, search, and keyboard support.
- The code-window treatment.
- The basic separation between articles and notes.

## Review path and evidence

| Step | Scope | Judgment |
|---|---|---|
| 1 | Desktop homepage against Dan and Anthony | Direction is sound; dates and the introduction can be less prominent |
| 2 | Desktop article against Dan and Josh | Reading hierarchy is clear; too much information precedes the body |
| 3 | Mobile article | Highest priority: bring the body forward and compress source/contents elements |
| 4 | Topic filtering against Julia and Simon's organization | Functional, but topics and formats are mixed |
| 5 | Author identity against Anthony and Maggie | Real identity information is missing; decoration is not the next priority |

![Desktop homepage at the time of review](/Users/mikey/Projects/personal/blog-mesh/artifacts/comparison/home-1280.jpg)

![Desktop article at the time of review](/Users/mikey/Projects/personal/blog-mesh/artifacts/comparison/article-desktop.jpg)

![Mobile article at the time of review](/Users/mikey/Projects/personal/blog-mesh/artifacts/comparison/article-mobile.jpg)

[Homepage measurements](/Users/mikey/Projects/personal/blog-mesh/artifacts/comparison/home-metrics.json) / [Mobile article measurements](/Users/mikey/Projects/personal/blog-mesh/artifacts/comparison/article-mobile-metrics.json)

[Initial research and reference screenshots](/Users/mikey/Projects/personal/blog-mesh/research/blog-style-study-2026-10-14.md)
