# Project instructions

## Language

- Use US English for all project-authored text: UI copy, articles, notes, documentation, research reports, comments, test descriptions, messages, and human-readable data labels.
- Use `en-US` for the application locale, document language, dates, and RSS. Use `en_US` for Open Graph metadata. Keep these values in `src/config.ts`.
- Use English filenames and identifiers, with American spelling and consistent terminology.
- Preserve publication dates, source URLs, proper names, licenses, and factual measurements when translating.
- Keep original third-party assets and historical screenshots intact as source evidence. Translate their captions and explanations. If a historical data label is translated, identify it as translated instead of presenting it as a new measurement.
- Run `npm run check:language` after changing project text. The standard `npm run check` also runs this guard.

## Structure

- Content lives in two collections, `src/content/articles` and `src/content/notes`. Their frontmatter schemas are in `src/lib/schema.ts` and are mirrored by `keystatic.config.ts`; change both together.
- Global CSS is limited to `src/styles/tokens.css`, `base.css`, and `prose.css`. Everything else is a scoped `<style>` in the component or page that owns the markup. Elements created by scripts are styled through `:global()` in the owning component.
- Browser behavior lives in `src/scripts/*.ts` modules imported by components. Keep pure logic in exported functions so it can be tested; keep DOM wiring in an `init*` function.
- Interactive React components live in `src/components/islands/` and are exposed to MDX through an Astro wrapper registered in `src/components/content/mdx-components.ts`. An island must render meaningful HTML without JavaScript and should hydrate with `client:visible` unless it is above the fold.
- Site identity and copy come from `src/config.ts`. Environment-specific values come from `.env`; see `.env.example`.
- Run `npm run format` before committing. CI runs `npm run check`, `npm test`, `npm run build`, and `npm run check:links`.

## Testing

All tests should prioritize quality and meaningful regression protection over test count or coverage metrics. Avoid redundant or low-value tests.

Add tests only for important behavior, core logic, and real regression risks: publication rules, content schemas, fence metadata, filtering and search matching, and similar pure functions. Do not duplicate coverage that existing tests already provide.

Pure UI copy, styling, or other nonfunctional frontend changes generally do not require new tests. Use appropriate build checks and focused browser verification.
