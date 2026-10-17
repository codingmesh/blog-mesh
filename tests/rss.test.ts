import assert from 'node:assert/strict';
import { test } from 'node:test';
import { absolutize, feedReadyHtml } from '../src/lib/feed-html.ts';

test('math becomes its TeX source and build-time diagrams point back to the article', () => {
  const html =
    '<p>Costs <math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>O</mi></mrow><annotation encoding="application/x-tex">O(n)</annotation></semantics></math>.</p>' +
    '<math display="block"><semantics><mrow/><annotation encoding="application/x-tex">T(n) = 2T(n/2)</annotation></semantics></math>' +
    '<figure class="diagram"><div class="diagram-frame"><svg role="img" aria-label="The three outcomes"><g/></svg></div><figcaption>Cap</figcaption></figure>';
  const out = feedReadyHtml(html, 'https://example.com/writing/x/');
  assert.ok(out.includes('<p>Costs <code>O(n)</code>.</p>'));
  assert.ok(out.includes('<pre><code>T(n) = 2T(n/2)</code></pre>'));
  assert.ok(!out.includes('<svg'));
  assert.ok(out.includes('<em>The three outcomes</em>: <a href="https://example.com/writing/x/">see the diagram'));
  assert.ok(out.includes('<figcaption>Cap</figcaption>'));
});

test('root-relative media and links become absolute, including srcset candidates', () => {
  const out = absolutize(
    '<a href="/writing/a/"><img src="/_astro/a.webp" srcset="/_astro/a-1.webp 720w, /_astro/a-2.webp 1440w"></a><video poster="/p.jpg" src="/d.mp4"></video><a href="#fn1">1</a>',
    'https://example.com',
  );
  assert.ok(out.includes('href="https://example.com/writing/a/"'));
  assert.ok(out.includes('src="https://example.com/_astro/a.webp"'));
  assert.ok(
    out.includes('srcset="https://example.com/_astro/a-1.webp 720w, https://example.com/_astro/a-2.webp 1440w"'),
  );
  assert.ok(out.includes('poster="https://example.com/p.jpg"'));
  assert.ok(out.includes('href="#fn1"'), 'in-page links are left alone');
});
