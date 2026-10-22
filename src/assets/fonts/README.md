# Font assets

The [typography standard](../../../docs/typography.md) defines the required font roles, responsive type scale, spacing, reading width, and acceptance checks. This file documents the local assets and their registration. Existing CSS differences are tracked in the standard's migration checklist.

## Registered browser fonts

| Family          | Files                                                                 | Weights            | Styles                          |
| --------------- | --------------------------------------------------------------------- | ------------------ | ------------------------------- |
| Newsreader 24pt | `newsreader/Newsreader24pt-*.woff2`                                   | 400, 600, 700      | Normal; italic at 400           |
| Folio Sans      | `folio/FolioSans-{Regular,Medium,SemiBold,Bold}.woff2` (static Latin) | 400, 500, 600, 700 | Normal; italic variable 300–800 |
| JetBrains Mono  | `jetbrains-mono/JetBrainsMono-Regular.woff2` (static Latin)           | 400                | Normal                          |

Newsreader's registered normal files are `Regular` (400), `SemiBold` (600), and `Bold` (700). `Italic` is weight 400. `Medium` (500) stays on disk unregistered; no role uses it. Its `24pt` name identifies an optical design, not the CSS font size.

The registered Folio Sans and JetBrains Mono files are static instances of the variable sources `folio/FolioSans-Roman.woff2` and `jetbrains-mono/JetBrainsMono-Variable.woff2`, pinned to one weight (Folio Sans at optical size 16) and subset to the Latin, punctuation, symbol, arrow, and box-drawing ranges the site uses, with all layout features kept. They were made with fontTools' instancer and subsetter. Each interface weight is about 20 KB instead of the 118 KB variable file, and the code face is 41 KB instead of 113 KB. The variable sources remain on disk as the origin for any new instance. Folio Sans italic is still the variable file; no interface text is italic today, and it only loads if some is.

Browser text never fakes a face: `font-synthesis: none` is set on the body, so a weight or style without a file falls back to the nearest real one.

Newsreader 60pt and Folio Serif remain on disk as optional assets. They are not registered for browser text. Keep their filenames distinct from active families.

## Browser registration

Register local WOFF2 files in `astro.config.mjs` with `fontProviders.local()`. Static files take one variant per weight and style. A variable file uses its supported weight range:

```js
// A static variant.
{ weight: 400, style: 'normal', src: ['./src/assets/fonts/newsreader/Newsreader24pt-Regular.woff2'] }

// A variable variant (Folio Sans italic).
{ weight: '300 800', style: 'italic', src: ['./src/assets/fonts/folio/FolioSans-Italic.woff2'] }
```

Use `style: 'italic'` with the matching italic file. Do not declare styles or weights that the selected file cannot provide. If a new role needs a weight that has no static file, instance it from the variable source rather than registering the whole variable file.

The family variables are injected by the `<Font />` components in `src/layouts/Base.astro` and exposed through the aliases in `src/styles/tokens.css`:

| Font loader variable | Component family token | Family          |
| -------------------- | ---------------------- | --------------- |
| `--font-serif`       | `--serif`, `--display` | Newsreader 24pt |
| `--font-sans`        | `--sans`               | Folio Sans      |
| `--font-mono`        | `--mono`               | JetBrains Mono  |

Use component tokens instead of hardcoding Astro's generated family names. `--display` resolves to `--serif`; it does not activate the stored Newsreader 60pt files.

Preloads follow the page. Every page preloads Newsreader normal 400 and 700 for its title and summary, and the three Folio Sans weights the interface shows at once (400 body text, 500 labels, 600 site name). Article pages add Newsreader italic 400 for the subtitle; the home page adds Newsreader 600 for the featured title. Pages pass their list through the `preload` prop of `src/layouts/Base.astro`. Other styles and weights load when used.

## Social-card assets

The current renderer in `src/lib/og.ts` reads these local static TTF files:

- `newsreader/Newsreader24pt-Bold.ttf`: title face at weight 700.
- `folio/FolioSans-Regular.ttf`: label face at weight 400, a static instance of the variable file (weight 400, optical size 16) made with fontTools, because the renderer does not read variable fonts.
- `folio/FolioSans-SemiBold.ttf`: the site name at weight 600, the same role as the page header; made the same way.

`newsreader/Newsreader24pt-Regular.ttf` and `jetbrains-mono/JetBrainsMono-Regular.ttf` are static instances kept for cards that show reading text or technical notation; the current layout uses neither.

Browser registrations and image-renderer registrations are independent. After changing a card font, verify the generated image for wrapping, clipping, and the intended weight. Asset files, renderer registration, and the typography standard must agree before migration is marked complete.
