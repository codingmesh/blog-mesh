# Project instructions

## Language

- Use US English for all project-authored text: UI copy, articles, notes, documentation, research reports, comments, test descriptions, messages, and human-readable data labels.
- Use `en-US` for the application locale, document language, dates, and RSS. Use `en_US` for Open Graph metadata. Keep these values in `src/config.ts`.
- Use English filenames and identifiers, with American spelling and consistent terminology.
- Preserve publication dates, source URLs, proper names, licenses, and factual measurements when translating.
- Keep original third-party assets and historical screenshots intact as source evidence. Translate their captions and explanations. If a historical data label is translated, identify it as translated instead of presenting it as a new measurement.
- Run `npm run check:language` after changing project text. The standard `npm run check` also runs this guard.

## Testing

All tests should prioritize quality and meaningful regression protection over test count or coverage metrics. Avoid redundant or low-value tests.

Add tests only for important behavior, core logic, and real regression risks. Do not duplicate coverage that existing tests already provide.

Pure UI copy, styling, or other nonfunctional frontend changes generally do not require new tests. Use appropriate build checks and focused browser verification.
