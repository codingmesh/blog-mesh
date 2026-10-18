# Font usage

## Choose a font

| Font                      | Use for                                                | Available weights and styles            |
| ------------------------- | ------------------------------------------------------ | --------------------------------------- |
| Newsreader 24pt           | Paragraphs and smaller serif headings                  | Normal: 400, 500, 600, 700; italic: 400 |
| Newsreader Display (60pt) | Large serif titles                                     | Normal: 400, 600                        |
| Folio Sans                | Sans-serif titles, summaries, navigation, and controls | Variable: 300–800; normal and italic    |
| Folio Serif               | Long-form reading text                                 | Variable: 300–800; normal and italic    |
| JetBrains Mono            | Code and metadata                                      | Variable: 100–800; normal               |

Newsreader's 24pt and 60pt names identify optical designs, not required CSS font sizes. Use WOFF2 files for browser text. The TTF files are used separately by the social-card renderer in `src/lib/og.ts`.

## Use the active CSS tokens

| Token       | Currently configured font |
| ----------- | ------------------------- |
| `--serif`   | Folio Serif               |
| `--display` | Folio Sans (`--sans`)     |
| `--sans`    | Folio Sans                |
| `--mono`    | JetBrains Mono            |

Use these tokens in component styles instead of hardcoding family names:

```css
.title {
  font: 600 40px/1.15 var(--display);
}

.summary {
  font: 400 20px/1.6 var(--serif);
}

.label {
  font: 400 15px/1.4 var(--sans);
}

.code {
  font: 400 14px/1.6 var(--mono);
}
```

Article paragraphs currently use 18px/1.65, decreasing to 17px at widths up to 540px. Keep paragraph text at weight 400 and use 600 for headings. Adjust title sizes in the owning page's scoped styles to accommodate narrow screens.

## Enable the Folio families

The Folio files in `folio/` are active. These are the steps that enabled them, kept for reference:

1. In `astro.config.mjs`, replace the serif and sans font registrations with local families named `Folio Serif` and `Folio Sans`. Retain their `--font-serif` and `--font-sans` CSS variables and use the existing `fontProviders.local()` variant structure.
2. Register each family's `Roman` file with `style: 'normal'` and its `Italic` file with `style: 'italic'`. Declare `weight: '300 800'` on every variant. File paths are `./src/assets/fonts/folio/FolioSans-Roman.woff2`, `FolioSans-Italic.woff2`, `FolioSerif-Roman.woff2`, and `FolioSerif-Italic.woff2`, all in the same directory.
3. In `src/styles/tokens.css`, update the serif and sans fallback family names to the Folio aliases, and set `--display: var(--sans)` to use Folio Sans for large titles. Keep `--mono` unchanged.
4. Remove the unused Newsreader Display registration and its `<Font cssVariable="--font-display" />` element in `src/layouts/Base.astro`. Keep the serif and sans `<Font />` elements. Preload only the styles and weights used immediately on the page.
5. In `src/styles/prose.css`, set article section headings to `font-family: var(--sans)`. Paragraphs retain `var(--serif)`.

Explicitly set regular reading text to weight 400; Folio Serif's embedded default is 300. Both Folio families support optical sizes from 16 to 48. Use `font-optical-sizing: auto` when allowing the browser to adjust the optical design to the text size.

A starting scale for this combination is 40–52px/700 for large titles, 24–25px/600 for section headings, 18px/400 for paragraphs, and 14–15px/400 for code. Keep paragraph line height between 1.55 and 1.65. Reduce title sizes on narrow screens.

## Check the result

Check the homepage and an article with code in the browser. Confirm the computed font family, successful font requests, and loaded font state for titles, paragraphs, navigation, and code. Check regular, italic, and bold text where used, along with title wrapping on narrow screens.

Run `npm run build` after changing font configuration. Run `npm run check:language` after changing this guide.
