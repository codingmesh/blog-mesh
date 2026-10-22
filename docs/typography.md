# Typography standard

Version 1.0 · October 18, 2026

This document is the authoritative typography standard for the blog. It defines the target appearance and required font roles. The current implementation partially conforms; the migration checklist at the end identifies the remaining work. Creating this standard does not apply those stylesheet changes.

Rules marked **must** are requirements. Font files and loader details are documented in [the font asset guide](../src/assets/fonts/README.md). That guide must not define a competing type scale.

## 1. Font families and responsibilities

| Family          | Required uses                                                                                                                                             | Excluded uses                                                                              |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| Newsreader 24pt | Editorial titles, subtitles, publication dates, reading time beside a date, article text, summaries, captions, footnotes, and prose inside content blocks | Site navigation, form controls, technical notation                                         |
| Folio Sans      | Site identity, navigation, buttons, inputs, filters, contents navigation, interface labels, status text, data tables, and footer copy                     | Article headings, paragraphs, subtitles, publication dates                                 |
| JetBrains Mono  | Code, terminal output, filenames, code identifiers, and keyboard hints                                                                                    | Ordinary dates, reading time, tags, navigation, section labels, citations, and footer copy |

Newsreader must remain the same 24pt optical design across titles and body text. The name identifies the design, not the CSS font size. Newsreader 60pt and Folio Serif are optional stored assets, not active alternatives within this standard.

The same semantic role must use the same family throughout the site. In particular, publication dates must not alternate between serif, sans, and mono on different pages.

## 2. Type scale

All sizes below are CSS pixels at the default 16px root size. Implement fixed sizes in `rem` by dividing these values by 16. Keep the root at `100%` so browser text-size preferences continue to work. Line heights are unitless.

Use one typography breakpoint: **600px and below** uses the narrow-screen column; **above 600px** uses the desktop column. Existing layout breakpoints may remain independent. The role names below are semantic identifiers for styles, not mandatory HTML tags.

| Role                              | Family         | Weight / style | Desktop size | Narrow-screen size | Line height |
| --------------------------------- | -------------- | -------------- | ------------ | ------------------ | ----------- |
| `article-title`                   | Newsreader     | 700 normal     | 56           | 40                 | 1.1         |
| `article-subtitle`                | Newsreader     | 400 italic     | 22           | 20                 | 1.6         |
| `article-date`                    | Newsreader     | 400 normal     | 18           | 17                 | 1.6         |
| `article-attribution`             | Newsreader     | 400 normal     | 16           | 16                 | 1.5         |
| `body`                            | Newsreader     | 400 normal     | 20           | 18                 | 1.6         |
| `section-heading`                 | Newsreader     | 600 normal     | 32           | 28                 | 1.2         |
| `subsection-heading`              | Newsreader     | 600 normal     | 24           | 22                 | 1.3         |
| `minor-heading`                   | Newsreader     | 600 normal     | 20           | 20                 | 1.4         |
| `home-title`                      | Newsreader     | 700 normal     | 48           | 36                 | 1.15        |
| `page-title`                      | Newsreader     | 700 normal     | 44           | 36                 | 1.15        |
| `featured-title`                  | Newsreader     | 600 normal     | 28           | 24                 | 1.25        |
| `entry-title`                     | Newsreader     | 400 normal     | 20           | 20                 | 1.5         |
| `summary`                         | Newsreader     | 400 normal     | 20           | 18                 | 1.6         |
| `entry-meta`                      | Newsreader     | 400 normal     | 16           | 16                 | 1.5         |
| `next-title`                      | Newsreader     | 600 normal     | 20           | 20                 | 1.4         |
| `caption` / `footnote`            | Newsreader     | 400 normal     | 16           | 16                 | 1.5         |
| `content-block`                   | Newsreader     | 400 normal     | 18           | 18                 | 1.6         |
| `site-name`                       | Folio Sans     | 600 normal     | 17           | 17                 | 1.6         |
| `navigation` / `contents-link`    | Folio Sans     | 400 normal     | 15           | 15                 | 1.5         |
| `interface-label`                 | Folio Sans     | 500 normal     | 14           | 14                 | 1.5         |
| `supporting-ui` / `footer`        | Folio Sans     | 400 normal     | 14           | 14                 | 1.6         |
| `control`                         | Folio Sans     | 500 normal     | 15           | 15                 | 1.4         |
| `search-dialog-title`             | Folio Sans     | 600 normal     | 22           | 22                 | 1.3         |
| `search-input`                    | Folio Sans     | 400 normal     | 17           | 17                 | 1.5         |
| `search-result-title`             | Newsreader     | 600 normal     | 20           | 20                 | 1.3         |
| `search-result-excerpt` / `table` | Folio Sans     | 400 normal     | 15           | 15                 | 1.5         |
| `code-block`                      | JetBrains Mono | 400 normal     | 15           | 14                 | 1.6         |
| `technical-label`                 | JetBrains Mono | 400 normal     | 13           | 13                 | 1.5         |
| `keyboard-hint`                   | JetBrains Mono | 400 normal     | 12           | 12                 | 1.4         |

Use `article-title` for full article and note pages. Use `page-title` for archive, about, and error pages. Homepage section names such as Latest and Notes use `interface-label`, not an article heading role. HTML heading levels must still follow the document outline.

The smaller technical-label and keyboard-hint sizes are confined to short technical strings. Ordinary labels and supporting text must not inherit these sizes.

## 3. Letter spacing, weight, and emphasis

- Newsreader must use `letter-spacing: normal` in every role. Remove inherited negative tracking from article titles, page titles, featured titles, and section headings.
- Folio Sans must also use normal tracking in navigation and ordinary labels. Do not inherit tracking from a blanket `h1, h2, h3` rule.
- JetBrains Mono must use normal tracking. Monospaced glyphs do not need additional letter spacing.
- Body text must explicitly request weight 400. Editorial section headings and inline strong emphasis use 600; primary titles use 700.
- Italic emphasis must use the real Newsreader 400 italic file. Do not synthesize bold italic, use a slanted normal face, or combine weight 600/700 with italic without adding the matching font asset and updating this standard.
- Use italic for subtitles, work titles in citations, and deliberate emphasis. Do not italicize an entire long source-and-author attribution.
- Ordinary labels must use sentence case. Do not turn dates, labels, or reading time into widely spaced uppercase technical text.

## 4. Article header and spacing

The header order is: title, optional descriptive subtitle, optional source attribution, then publication date and reading time. Omit absent elements and their gaps. Do not repeat the same description, citation, or date in the opening paragraph.

A subtitle briefly describes the article. A source citation uses `article-attribution`; a long citation must not be promoted to the larger italic subtitle role. Use the existing content fields; this standard does not require a new schema field.

| Gap between visible blocks                    | Desktop | Narrow screens |
| --------------------------------------------- | ------- | -------------- |
| Title to subtitle                             | 8px     | 8px            |
| Subtitle to attribution, when both exist      | 16px    | 12px           |
| Title to attribution, when no subtitle exists | 12px    | 12px           |
| Last introductory block to date line          | 36px    | 24px           |
| Date line to first body block                 | 24px    | 24px           |
| Consecutive paragraphs                        | 20px    | 20px           |
| Body block to section heading                 | 48px    | 36px           |
| Section heading to following block            | 16px    | 12px           |
| Body block to subsection heading              | 32px    | 28px           |
| Subsection heading to following block         | 12px    | 12px           |

These values describe the final visible gaps. Do not add overlapping component margins, header padding, and prose padding that count the same gap twice. Keep the title and optional subtitle visually connected, with a larger pause before the date.

Publication dates and adjacent reading time use `article-date` on article pages and `entry-meta` in lists and featured entries. Use the site's `en-US` date formatter. Preserve the stored publication date and its precision; never invent a day for a month-only date. Dates are upright, muted, and normally spaced. Use tabular numerals only where aligned date columns benefit from them; a mono family is unnecessary.

## 5. Reading width, wrapping, and color

- Article headers and reading text must share a centered column with a maximum width of **620px**. Apply page gutters once: 24px per side above 600px, 20px at 600px and below, and 16px at 360px and below. Nested content uses the available width without adding another page gutter.
- The wider site shell, navigation, and archives may retain their 720px maximum. The contents rail must sit outside the article column without causing horizontal page scrolling; collapse it when space is insufficient.
- The pixel-width cap is authoritative. A `ch` limit may supplement it but must not allow Newsreader text to expand to a 720px reading column.
- Titles may use balanced wrapping, and paragraphs may use pretty wrapping as progressive enhancements. Natural wrapping must remain readable. Do not add manual line breaks or nonbreaking spaces to force a particular headline shape.
- Prose must wrap long URLs. Code and data tables may scroll within their own containers; the page itself must not scroll horizontally.
- Titles, subtitles, paragraphs, and headings use `--ink`. Dates, attribution, captions, and secondary UI use `--muted`. Links use the existing link rules and `--accent` where appropriate. Use theme tokens, not ad hoc text colors or opacity reductions.
- Family, size, weight, and spacing must remain the same between light and dark themes. Only the color tokens change. Maintain readable contrast in both themes; ordinary text must meet 4.5:1 contrast.

## 6. Component rules

| Surface                | Required treatment                                                                                                                                                  |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Homepage               | `home-title`, `summary`, and `featured-title`; interface labels divide sections. Dates, topics, and reading time beside entries use `entry-meta`.                   |
| Archives               | `page-title`, `entry-title`, and `entry-meta`; filters and result counts use Folio Sans.                                                                            |
| Article and note pages | Editorial roles throughout the header and prose; contents controls and share actions use Folio Sans.                                                                |
| About and error pages  | `page-title`; reading paragraphs and editorial headings use Newsreader; recovery buttons and status text use Folio Sans.                                            |
| Search                 | Folio Sans for the dialog, input, controls, and excerpts; Newsreader for result titles. Highlight matches without changing their surrounding font.                  |
| Asides and transcripts | Newsreader `content-block` for prose; Folio Sans `interface-label` for note labels and speakers. Timestamps are supporting UI, not code.                            |
| Figures and footnotes  | Newsreader `caption` / `footnote`; video controls remain interface elements.                                                                                        |
| Tables                 | Folio Sans `table` with weight 600 for headers. Code identifiers inside cells keep their inline-code role.                                                          |
| Quotes                 | Inherit the body family and size; a short quotation may use the real italic face. Citations use Newsreader at 16px.                                                 |
| Lists                  | Inherit body typography, including marker family and size. Do not render ordinary list numbers in mono.                                                             |
| Code                   | JetBrains Mono for code, output, and filenames. Inline code uses `0.9em` relative to its surrounding text. Copy, wrap, and expand controls use Folio Sans or icons. |
| Diagrams               | Folio Sans at a readable scale for ordinary labels; mono only for technical notation. Keep label measurement and rendered fonts compatible.                         |
| Footer                 | Folio Sans `footer`; preserve the existing compact layout.                                                                                                          |

Social cards are a fixed-pixel output and have a separate scale: Newsreader 24pt/700 titles at 72px for titles up to 44 characters, 62px for 45–70 characters, and 54px for longer titles. Supporting editorial text uses Newsreader 400, and ordinary labels use Folio Sans. Mono is reserved for actual technical notation. Cards must be inspected for clipping and wrapping after any font change.

## 7. Implementation contract

Family tokens must remain:

```css
--serif: var(--font-serif, 'Newsreader', Georgia, 'Times New Roman', serif);
--display: var(--serif);
--sans: var(--font-sans, 'Folio Sans', -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif);
--mono: var(--font-mono, 'JetBrains Mono', ui-monospace, 'SFMono-Regular', Menlo, Consolas, monospace);
```

The `--font-*` variables come from Astro's font loader. Treat the tokens above as family aliases, not complete text styles. Bind an element to a semantic role before choosing its size and weight. New components must reuse the role table rather than introduce a near-duplicate local scale.

Implementation ownership:

- `astro.config.mjs`: local files, weights, styles, and fallback registration.
- `src/layouts/Base.astro`: font declarations and preloads. Preload only faces needed above the fold: Newsreader normal 400 and 700, Newsreader italic 400 for the article subtitle, and Folio Sans normal for the header. Secondary weights load when used.
- `src/styles/tokens.css`: shared family, size, and reading-width tokens.
- `src/styles/base.css`: document defaults and shared text roles.
- `src/styles/prose.css`: article text, headings, lists, quotations, and code.
- Owning page or component: scoped role application and layout spacing. Script-created nodes use scoped `:global()` selectors.
- `src/lib/og.ts`: static font registrations and social-card typography. WOFF2 browser changes do not update these registrations automatically.

Use local WOFF2 files for browser text. Image rendering uses compatible local static font files. A font asset on disk does not activate it; registration, token selection, and the element's computed style must all agree.

## 8. Acceptance and migration

A typography change is complete only when:

1. Its affected roles match this standard, including family, weight, style, size, line height, tracking, and spacing.
2. The homepage, archives, article, about page, search, and affected content blocks have been checked at 1280px, 768px, 390px, and 320px widths, scoped to the surfaces the change affects.
3. Browser font requests succeed, the intended faces are loaded, and regular, strong, and italic text use available files. A computed family stack alone is insufficient evidence.
4. Long titles, dates, URLs, tables, and code do not cause page overflow. Text remains usable with browser zoom and increased text size.
5. Light and dark themes remain readable, and generated social cards have been inspected when their fonts change.
6. `npm run check` and `npm run build` pass. Documentation-only changes require formatting and `npm run check:language`; they do not require new tests or a production build.

Current migration status:

| Area                                                                                  | Status                                                                                       |
| ------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| Local Newsreader 24pt, Folio Sans, and JetBrains Mono files and browser registrations | Available                                                                                    |
| Newsreader normal 400/700, italic 400, and Folio Sans normal preloads                 | Configured; italic 400 added so the subtitle no longer shifts the prose when it arrives      |
| Newsreader titles and reading text                                                    | Done on article pages: body, section and subsection headings, captions, footnotes, citations |
| Normal tracking throughout headings and labels                                        | Done                                                                                         |
| 620px article column                                                                  | Done; the rail appears from 1000px (narrow) and 1140px (full)                                |
| Unified 600px typography breakpoint                                                   | Done for tokens, prose, and article pages                                                    |
| Article title / subtitle / date scale                                                 | Done: 56/40, 22/20 italic, 16 attribution, 18/17 date, with the section 4 gaps               |
| Editorial metadata, footer, captions, and content-block role consistency              | Done                                                                                         |
| Mono restricted to technical notation                                                 | Done                                                                                         |
| Social-card supporting labels                                                         | Done; labels use a static Folio Sans 400 TTF                                                 |

The checklist is a snapshot, not an exception to the standard. Update it as implementation work is verified. Font roles or scale changes must update this document first, followed by the implementation and asset guide as needed.
