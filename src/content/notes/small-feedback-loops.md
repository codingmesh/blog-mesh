---
title: What this blog checks before publishing
description: The repository checks behind the articles, and the editorial questions those checks cannot answer.
date: 2026-10-14
tags:
  - Development practice
draft: false
sample: false
---

These commands and behaviors are documented in the [repository](https://github.com/codingmesh/blog-mesh), rather than taken from a sample run.

## Four checks with different jobs

```sh
npm run check
npm test
npm run build
npm run check:links
```

`check` runs the US English guard, formatting validation, and Astro's diagnostics. The language guard detects certain non-English characters and locale mismatches; it does not establish that a sentence is good English or factually correct.

`test` runs the existing suites for behavior such as publication filtering, content schemas, and search matching. Publication filtering excludes drafts and future-dated entries. A future-dated article becomes eligible on a later build; changing the clock does not update already generated pages.

`build` renders the site and generates the Pagefind search index. `check:links` then verifies internal links and asset references against the build output. It does not fetch external sources or verify that a cited page supports an article's claims.

## What still needs a person to read it

A valid content file can cite the wrong author. A working link can point to an article that never made the claimed measurement. A successful build cannot distinguish a real conversation from an invented transcript.

For a reading note, verification therefore includes opening the original source and comparing its claims with the summary. For a page change, a focused browser check confirms that the title, attribution, code, and navigation are readable in the rendered result.

There are no sample pass counts here: results belong to a particular run. The useful record is the command, its actual outcome, and any remaining limitation.
