# Font assets

The [typography standard](../../../docs/typography.md) defines the required font roles, responsive type scale, spacing, reading width, and acceptance checks. This file documents the local assets and their registration. Existing CSS differences are tracked in the standard's migration checklist.

## Registered browser fonts

| Family          | Files                                         | Weights            | Styles                |
| --------------- | --------------------------------------------- | ------------------ | --------------------- |
| Newsreader 24pt | `newsreader/Newsreader24pt-*.woff2`           | 400, 500, 600, 700 | Normal; italic at 400 |
| Folio Sans      | `folio/FolioSans-*.woff2`                     | Variable, 300–800  | Normal and italic     |
| JetBrains Mono  | `jetbrains-mono/JetBrainsMono-Variable.woff2` | Variable, 100–800  | Normal                |

Newsreader's normal files are `Regular` (400), `Medium` (500), `SemiBold` (600), and `Bold` (700). `Italic` is weight 400. Its `24pt` name identifies an optical design, not the CSS font size.

Folio Sans supports optical sizes from 16 to 48. Declare `font-optical-sizing: auto` where automatic optical sizing is desired. Newsreader's static 24pt files do not have a variable optical-size axis.

Newsreader 60pt and Folio Serif remain on disk as optional assets. They are not registered for browser text. Keep their filenames distinct from active families.

## Browser registration

Register local WOFF2 files in `astro.config.mjs` with `fontProviders.local()`. Newsreader requires one variant per weight and style. Variable fonts use their supported weight range:

```js
// A static Newsreader variant.
{ weight: 400, style: 'normal', src: ['./src/assets/fonts/newsreader/Newsreader24pt-Regular.woff2'] }

// A variable Folio Sans variant.
{ weight: '300 800', style: 'normal', src: ['./src/assets/fonts/folio/FolioSans-Roman.woff2'] }
```

Use `style: 'italic'` with the matching italic file. JetBrains Mono uses `weight: '100 800'`. Do not declare styles or weights that the selected file cannot provide.

The family variables are injected by the `<Font />` components in `src/layouts/Base.astro` and exposed through the aliases in `src/styles/tokens.css`:

| Font loader variable | Component family token | Family          |
| -------------------- | ---------------------- | --------------- |
| `--font-serif`       | `--serif`, `--display` | Newsreader 24pt |
| `--font-sans`        | `--sans`               | Folio Sans      |
| `--font-mono`        | `--mono`               | JetBrains Mono  |

Use component tokens instead of hardcoding Astro's generated family names. `--display` resolves to `--serif`; it does not activate the stored Newsreader 60pt files.

Newsreader normal 400 and 700 are preloaded for paragraphs and titles. Folio Sans normal is preloaded for the header. Other styles and weights load when used.

## Social-card assets

The current renderer in `src/lib/og.ts` reads these local static TTF files:

- `newsreader/Newsreader24pt-Bold.ttf`: title face at weight 700.
- `newsreader/Newsreader24pt-Regular.ttf`: reading face at weight 400.
- `folio/FolioSans-Regular.ttf`: label face at weight 400, a static instance of the variable file (weight 400, optical size 16) made with fontTools, because the renderer does not read variable fonts.

`jetbrains-mono/JetBrainsMono-Regular.ttf` is a static instance kept for cards that show technical notation; the current layout does not use it.

Browser registrations and image-renderer registrations are independent. After changing a card font, verify the generated image for wrapping, clipping, and the intended weight. Asset files, renderer registration, and the typography standard must agree before migration is marked complete.
