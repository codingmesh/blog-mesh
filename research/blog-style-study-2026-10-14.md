# Personal blog styles in the GitHub and open-source community

Research date: October 14, 2026. Eight technical and design-engineering authors were selected to represent different publishing approaches, not a GitHub ranking. See the [primary-source notes](./blog-sources-2026-10-14.md) for identity and profile verification.

This report was translated into US English on October 15, 2026. It describes the original research session. Historical screenshots retain their original pixels.

## Main finding

The shared quality across these sites is consistency between content organization and the author's personality. Minimalism is not the only answer: Dan uses distinctive titles, Anthony combines projects with personal interests, Josh builds an educational identity through graphics and interaction, and Maggie uses editorial typography and illustration.

The initial recommendation for blog-mesh was **Anthony's archive structure with Dan's reading rhythm**, adding Maggie's distinction between content types if articles and evolving notes coexist. This was a design recommendation, not an objective ranking. The workspace was empty at the time of the initial research.

## Comparison

| Author and sources | Style interpretation | Observed details | Useful reference | Conditions and tradeoffs |
|---|---|---|---|---|
| [Dan Abramov](https://overreacted.io/) / [GitHub](https://github.com/gaearon) | Minimal publishing centered on writing | One column, wide margins, bold pink titles, serif summaries and body text; direct article list | Typography and spacing establish identity | A larger archive needs topic entry points; sparse layouts depend on careful typography |
| [Anthony Fu](https://antfu.me/) / [GitHub](https://github.com/antfu) | An open-source author's personal studio | Signature mark, muted text, subtle background detail, large outlined years in the archive | Projects, writing, talks, and photography share one identity | Navigation is extensive; some secondary text was quite dark in the captured theme |
| [Josh W. Comeau](https://www.joshwcomeau.com/) / [GitHub](https://github.com/joshwcomeau) | Playful educational publishing | Colorful graphics, character illustration, layered landscape, article contents, and example controls | Visual expression supports technical explanation | Graphics and interaction require ongoing work; best suited to tutorials |
| [Julia Evans](https://jvns.ca/) / [GitHub](https://github.com/jvns) | A traditional knowledge index | Orange title and ribbon, white reading area, textured gray background, dense dated lists | Recent posts coexist with a full topic index | Needs enough content to justify the index; a long homepage benefits from jump links |
| [Simon Willison](https://simonwillison.net/) / [GitHub](https://github.com/simonw) | A frequent research log | Large site title, tags, search, multiple entry types, and a highlights sidebar | Articles, links, quotes, and short notes have distinct entry points | High density suits frequent publishing; highlights help first-time readers |
| [Maggie Appleton](https://maggieappleton.com/) / [GitHub](https://github.com/MaggieAppleton) | Digital-garden editorial design | Large serif statement, warm dark background, pink/teal accents, illustrated essays, text-based notes | Distinguishes developed essays from evolving ideas | Original illustration and editorial organization require investment |
| [Sindre Sorhus](https://sindresorhus.com/) / [GitHub](https://github.com/sindresorhus) | An independent developer's product hub | Glowing portrait, gradient name, Apps/Code buttons; a simpler single-column blog | The homepage showcases products while writing explains decisions | Product discovery takes priority over reading |
| [Lee Robinson](https://leerob.com/) / [GitHub](https://github.com/leerob) | An illustrated personal editorial page | Serif text, thin dividers, biography length switch, notes index, large illustration | Evergreen viewpoints are separated from dated articles | Illustration is a major focal point and needs personal material |

Style names and suitability are interpretations. Structure, color, and composition were observed in the screenshots below. Most captures show a dark theme; this does not mean the sites only support dark mode or that dark mode is inherently better for technical writing.

## Three possible directions

### A. A quiet developer's workspace: initial recommendation

Reference Anthony and Dan. Use a short introduction, selected writing, recent updates, and a small number of projects. Group the archive by year and provide a dedicated article column. Use one accent color, with typography, line height, and spacing providing hierarchy. This suits sustained technical writing and open-source work with relatively low asset-maintenance costs.

Initial suggested values, not measurements of the reference sites: a 680–760px reading column, 17–18px Chinese body text, line height around 1.8, clear heading levels, and limited monospaced text for code and dates. Mixed-language and mobile reading still required testing. These values belong to the initial, pre-localization brief.

### B. A personal digital garden

Reference Maggie and Lee. Use serif headings, selective personal illustrations, and topic sections. Distinguish articles, notes, and projects, allowing notes to evolve. This suits research, reading notes, and work connecting design with technology. Establish the content types before adding complex relationship browsing.

### C. An explorable technical classroom

Reference Josh. Provide interactive examples, a clear table of contents, and explanatory visuals within articles. The homepage can be more expressive. This suits frontend, graphics, and algorithm education. Interaction should explain something, with decorative animation kept restrained.

## Principles to borrow

1. **Choose the main content unit first.** Dan emphasizes articles, Julia emphasizes topics, Simon emphasizes daily entries, and Maggie emphasizes developing ideas. The homepage should support that unit.
2. **One detail can establish personality.** A signature, accent color, illustration, or title treatment can carry the identity without stacking every decorative option.
3. **The homepage and article page have different jobs.** Personal expression can lead the homepage; paragraphs, code, figures, and navigation should remain easy to understand in an article.
4. **An archive needs more than chronology as it grows.** Topic, selected-content, or format entry points keep older writing discoverable.
5. **Recheck contrast instead of copying it.** Anthony's secondary navigation and year labels were very dark in the captured state. Borrow the hierarchy while verifying your own colors.

## Screenshot observations

These captures use a 1280 × 720 desktop viewport and document the visible state at the time. They do not establish full mobile behavior, performance, keyboard support, screen-reader compatibility, or measured color-contrast compliance. The sample includes article pages for Dan and Josh and blog indexes for Anthony and Sindre; the other captures focus on homepages.

### 01. Dan's homepage: a clear reading entry point

Bold pink article titles contrast with serif summaries, while generous margins concentrate attention on writing. The first screen has no project cards or large personal introduction.

![Dan's homepage](/Users/mikey/Projects/personal/blog-mesh/research/screenshots/01-overreacted.jpg)

### 02. Anthony's homepage: identity connected to work

A narrow text column includes project badges. Navigation covers multiple kinds of output, and background detail adds recognition. Secondary navigation contrast needs attention.

![Anthony's homepage](/Users/mikey/Projects/personal/blog-mesh/research/screenshots/02-antfu.jpg)

### 03. Josh's homepage: a strong identity with category navigation

Illustration occupies a substantial portion of the first screen. The content area combines article introductions with category navigation. This requires more visual production than a text-only blog.

![Josh's homepage](/Users/mikey/Projects/personal/blog-mesh/research/screenshots/03-josh.jpg)

### 04. Julia's homepage: direct, dense indexing

An orange ribbon, date column, and compact titles give the page a traditional blog character. Topic indexes follow recent posts, helping readers find older material.

![Julia's homepage](/Users/mikey/Projects/personal/blog-mesh/research/screenshots/04-julia.jpg)

### 05. Maggie's homepage: a clear editorial character

A large serif statement communicates the writing's themes. The personal introduction occupies the first screen, with the content collection starting below it.

![Maggie's homepage](/Users/mikey/Projects/personal/blog-mesh/research/screenshots/05-maggie.jpg)

### 06. Simon's homepage: rich discovery at high density

Search, tags, content-type navigation, and highlights appear together. The stream includes body excerpts, supporting repeat visits and research.

![Simon's homepage](/Users/mikey/Projects/personal/blog-mesh/research/screenshots/06-simon.jpg)

### 07. Lee's homepage: a personal introduction with illustration

Text sits beside a large city-and-landscape illustration, while Notes uses a list. The captured version cannot accurately be described as image-free minimalism.

![Lee's homepage](/Users/mikey/Projects/personal/blog-mesh/research/screenshots/07-lee.jpg)

### 08. Sindre's homepage: product destinations first

A portrait and name with glow effects, gradients, and prominent buttons establish the author identity. Apps and Code are the primary destinations.

![Sindre's homepage](/Users/mikey/Projects/personal/blog-mesh/research/screenshots/08-sindre.jpg)

### 09. Sindre's blog index: direct hierarchy

Large titles, summaries, dates, and reading times form a single-column list. Decoration is reduced compared with the homepage.

![Sindre's blog index](/Users/mikey/Projects/personal/blog-mesh/research/screenshots/09-sindre-blog.jpg)

### 10. Anthony's archive: distinctive year grouping with subdued text

Outlined years provide a recognizable structure. Dates and reading times are secondary to compact entries. Category navigation and supporting text are very dark in this captured state and should not be copied without review.

![Anthony's archive](/Users/mikey/Projects/personal/blog-mesh/research/screenshots/10-antfu-posts.jpg)

### 11. Dan's article: a stable reading column

[How to Fix Any Bug](https://overreacted.io/how-to-fix-any-bug/) combines a bold title, serif body text, and substantial paragraph spacing. A support button also occupies space before the body. Whether to include a similar element depends on the site's goals.

![Dan's article page](/Users/mikey/Projects/personal/blog-mesh/research/screenshots/11-overreacted-article.jpg)

### 12. Maggie's content area: distinct treatments for different formats

Essays use illustrated cards; Notes uses a text list. Content is not forced into a uniform card format. Format and maturity influence presentation.

![Maggie's content area](/Users/mikey/Projects/personal/blog-mesh/research/screenshots/12-maggie-garden.jpg)

### 13. Josh's article: navigation alongside teaching examples

The [Flexbox tutorial](https://www.joshwcomeau.com/css/interactive-guide-to-flexbox/) includes a separate article header, update date, right-side table of contents, and example controls. This review confirmed their presentation but did not test every interaction.

![Josh's article page](/Users/mikey/Projects/personal/blog-mesh/research/screenshots/13-josh-article.jpg)

## First-party design explanations

- [Maggie's colophon](https://maggieappleton.com/colophon): font choices, content growth stages, and site design. It names Canela Display, Canela Text, and Lato; the font names were not guessed from screenshots.
- [Josh's About page](https://www.joshwcomeau.com/about-josh/): interaction within a personal introduction.
- [Simon's About page](https://simonwillison.net/about/): content types and subscription options.
- [Complete identity and source verification](./blog-sources-2026-10-14.md).
