/**
 * Pure rewrites that prepare rendered article HTML for feed readers, kept free of Astro imports so they can be
 * tested directly. Blocks that depend on the page's stylesheet or scripts are replaced with reader-safe forms.
 */

/**
 * Math becomes its TeX source in code, build-time diagrams become a pointer to the article, and the empty heading
 * anchors go.
 */
export function feedReadyHtml(html: string, articleUrl: string) {
  return html
    .replace(
      /<math\b([^>]*)>[\s\S]*?<annotation encoding="application\/x-tex">([\s\S]*?)<\/annotation>[\s\S]*?<\/math>/g,
      (_, attributes: string, tex: string) =>
        attributes.includes('display="block"') ? `<pre><code>${tex.trim()}</code></pre>` : `<code>${tex.trim()}</code>`,
    )
    .replace(/<figure class="diagram">[\s\S]*?<div class="diagram-frame">[\s\S]*?<\/div>/g, (frame) => {
      const label = frame.match(/aria-label="([^"]*)"/)?.[1] || 'Diagram';
      return `<figure class="diagram"><p><em>${label}</em>: <a href="${articleUrl}">see the diagram in the article</a>.</p>`;
    })
    .replace(/<a class="anchor"[^>]*><\/a>/g, '');
}

/** Feed readers need absolute URLs for media and links; in-page hash links are left alone. */
export function absolutize(html: string, base: string) {
  return html.replace(/(src|href|poster|srcset)="(\/[^"]*)"/g, (_, attr, value) =>
    attr === 'srcset'
      ? `${attr}="${value.replace(/(^|,\s*)\//g, `$1${base}/`)}"`
      : `${attr}="${new URL(value, base).href}"`,
  );
}
