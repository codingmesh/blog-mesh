# Claude development source verification

Reviewed on October 18, 2026. This record supports the blog's reading notes. It records source verification and editorial decisions, not tests or product use by the site owner. The full text of each linked source was read, including disclosures and limitations.

## Existing reading notes

| Local article | Verified source | Author | Original publication date |
| --- | --- | --- | --- |
| `src/content/articles/agent-automations.mdx` | [Building effective agent automations](https://claude.dev/blog/building-effective-agent-automations/) | Lance Martin and CJ Avilla | October 8, 2026 |
| `src/content/articles/context-engineering.mdx` | [The new rules of context engineering for Claude 5 generation models](https://claude.dev/blog/the-new-rules-of-context-engineering-for-claude-5-generation-models/) | Thariq Shihipar | July 24, 2026 |
| `src/content/articles/spending-effort.mdx` | [Using Claude Code: Spending your effort](https://claude.dev/blog/spending-your-effort/) | Thariq Shihipar | September 25, 2026 |

These sources are real. Their summaries should not be removed merely because the local entries were marked as samples. Keep each local publication date separate from its source's date. Existing research records are `research/claude-reading-agent-automations.md` and `research/claude-reading-spending-effort.md`; do not duplicate their source summaries here.

For the context-engineering note, retain attribution for the internal evaluation claim. For the effort note, preserve the distinction between the author's examples and a general recommendation. None establishes a result measured in this repository.

## New source: code review

- Source: [How the Claude Code team does code review](https://claude.dev/blog/solving-code-review-at-anthropic/)
- Authors: Addy Osmani, Morgan Westlee Lunt, and Qing Wang
- Published: October 15, 2026
- Category: Engineering
- Source locator: “How we make the reviewer better,” “Human approval, scaled by risk,” and “Where this is going.”

Source digest: Layered verification, risk-based human approval, and rollback support review. Repeated automated findings can prevent convergence. Internal approval policy differs from the public reviewer; humans retain accountability. These are team-reported practices, not independently validated results.

Editorial direction: Build an original note around a small project's review stopping condition. A useful proposed application would ask a reviewer to identify a concrete failure, provide evidence, and explain why an existing check misses it. Keep this as a proposal. Do not claim the site owner adopted the process, reduced review time, or reproduced the team's metrics. Avoid numerical performance claims unless the note also carries their scope and attribution.

## New source: cloud sessions

- Source: [Claude Code in the cloud: a field guide to cloud sessions](https://claude.dev/blog/claude-code-in-the-cloud/)
- Author: Addy Osmani
- Published: October 6, 2026
- Category: Playbooks
- Source locator: opening demonstration disclosure, “Under the hood,” “Run code you don't fully trust,” and “Common questions.”

Source digest: Separate machines isolate tasks, not integration. Repository configuration travels; personal configuration does not. Demonstrations use a fictional repository with reported real runs. Restricted networking still permits model traffic and branch pushes. Idle machines can be reclaimed.

Editorial direction: Frame the note around specifying a complete handoff: scope, dependencies, acceptance evidence, and merge order. A hypothetical article edit and schema change make a useful local example of work that can run separately but must be checked together. Do not imply that this blog was migrated to cloud sessions. Skip pricing, plan availability, and hardware specifications; they are unnecessary to the argument and can change.

## Further reading, not selected for this update

[Automating eval design and hillclimbing with Claude](https://claude.dev/blog/automating-eval-design-and-hillclimbing/), by Lance Martin, published September 28, 2026. Read in full; defer a separate note to keep this update focused.

## Editorial requirements

Write original US English commentary and short attributed source summaries. Clearly distinguish hypothetical applications from observations. Include author names, source URLs, source dates, and local note dates. Preserve historical third-party images and their measurements; translate explanations without inventing new results. Do not present a reading note as a translation of the entire source.

## Implemented changes and verification

The two selected sources became `code-review-evidence.mdx` and `cloud-session-boundaries.mdx`, both dated October 18, 2026. The three existing reading notes retain their original local publication dates and now state their source dates and revision date in the body. Their application sections use proposals rather than an invented personal voice.

The two introductory sample notes were replaced with the site's editorial method and a factual explanation of repository checks, preserving their URLs and marking the revision date. Homepage and About copy now describe the published material and disclose AI assistance. No biography was invented.

`writing-blocks.mdx` remains on disk as a draft rendering fixture. Its dialogue is explicitly illustrative, fabricated command output was removed, and its recurrence example now names merge sort. Original media files were preserved. The fixture is excluded from public pages, Markdown exports, RSS, and search.

Verification performed on October 18, 2026:

- `npm run format` completed; `npm run check` passed its language and formatting guards and reported zero Astro diagnostics across 80 files.
- All 19 existing tests passed. No tests were added for this content and copy update.
- `npm run build` generated 12 HTML pages, with seven published entries indexed by Pagefind.
- `npm run check:links` passed with 309 internal references.
- Build-output inspection confirmed five published reading notes and two short notes, both new articles in RSS and the search metadata index, and no public rendering-fixture route or feed entry.
- Browser verification covered the desktop homepage at 1280 pixels, both new article metadata blocks at 375 pixels, the About page, and a full-text search returning the new review note. The inspected mobile pages had no horizontal overflow, and no page errors were reported. Screenshots are saved under `artifacts/content-review-2026-10-18/`.

These are local checks. The changes have not been committed, pushed, or deployed.
