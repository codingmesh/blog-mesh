# Reliable automation starts with visible failures

> Sample reading note prepared with AI assistance. The interpretations and suggestions below do not represent deployments, tests, migrations, or evaluations personally conducted by the site owner.

- Source: [Building effective agent automations](https://claude.dev/blog/building-effective-agent-automations/)
- Author: Lance Martin and CJ Avilla
- Original publication date: October 8, 2026
- Note prepared: October 14, 2026
- Suggested English title: Reliable automation starts with visible failures
- Translated into US English: October 15, 2026

## What the article says

1. The example keeps a separate cursor for each source instead of relying on a fixed time window, reducing the chance of missing or repeating items.
2. When a source cannot be read, it preserves the cursor and reports the failure. An unavailable source must not be treated as a source with no updates.
3. It records delivery and advances cursors only after publication is confirmed. User preferences and runtime state are stored separately, with limits on access and per-run costs.

These points summarize the [original reference implementation](https://claude.dev/blog/building-effective-agent-automations/).

## What I take from it

An automated summary can look complete even when it silently skips an important source. A reader sees a polished daily report, with little way to tell whether it covered everything it was supposed to check.

I would treat the amount of new content and the completeness of the check as separate signals. Even when nothing deserves a notification, the run should record what it checked and whether each check succeeded.

For a blog-reading assistant, I would start with three outcomes: checked with updates, checked without updates, and not checked successfully. All three can appear on the same page, but they should not all become an empty array in the data. Otherwise, a network problem can look exactly like an author who stopped publishing.

I would also give each article a stable identifier and track discovery, reading, drafting, and publication separately. Finding a link does not mean the full article was read. Producing a summary does not mean it is ready to publish. Explicit states make those distinctions easier to inspect.

## What still needs testing

This is an engineering reference from a product team, not a reliability proof. Before adopting it, I would test three interruptions: a source becoming unavailable, a successful delivery with a lost acknowledgment, and a run stopping partway through.

The questions are whether the system can recover, whether it creates duplicates, and whether the user can understand its progress. This reading note does not report results from running those tests.
