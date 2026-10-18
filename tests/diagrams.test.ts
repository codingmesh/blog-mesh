import assert from 'node:assert/strict';
import { test } from 'node:test';
import { diagramDefaults, renderMermaid, styleDot, themeSvg } from '../src/lib/diagrams.ts';

test('renderMermaid returns a themeable SVG and reports syntax errors as a build failure', () => {
  const element = renderMermaid('flowchart LR\n  A[Draft] --> B[Published]', 'diagram-1-');
  assert.ok(element);
  assert.equal(element.tagName, 'svg');
  const classes = element.properties.className as string[];
  assert.ok(classes.includes('pele') && classes.includes('pele-flowchart'));
  const html = JSON.stringify(element);
  assert.ok(html.includes('var(--pele-fg'), 'colors come from custom properties, not literals');
  assert.ok(html.includes('var(--pele-font'), 'font comes from a custom property');
  assert.ok(html.includes('Published'), 'labels are kept');
  assert.throws(() => renderMermaid('flowchart LR\n  A --> ', 'diagram-2-'), /Mermaid diagram could not be rendered/);
});

test('styleDot inserts the site defaults after the opening brace and leaves the graph intact', () => {
  const styled = styleDot('digraph G {\n  a -> b;\n}');
  assert.ok(styled.startsWith('digraph G {\n' + diagramDefaults));
  assert.ok(styled.endsWith('  a -> b;\n}'));
  assert.equal(styleDot('not a graph'), 'not a graph');
});

test('themeSvg sizes the drawing in pixels, drops tooltips, and maps literal colors to theme tokens', () => {
  const svg =
    '<?xml version="1.0"?><!DOCTYPE svg><!-- Generated --><svg width="206pt" height="152pt" viewBox="0 0 206 152" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">' +
    '<g class="node"><title>a</title><path fill="none" stroke="#6a675f" d="M0 0"/><text fill="#141414" font-family="IBM Plex Mono">a</text></g></svg>';
  const element = themeSvg(svg);
  assert.ok(element);
  assert.equal(element.properties.width, 275, '206pt in pixels');
  assert.equal(element.properties.height, 203, '152pt in pixels');
  assert.equal(element.properties.viewBox, '0 0 206 152');
  const html = JSON.stringify(element);
  assert.ok(!html.includes('"title"'), 'tooltips removed');
  assert.ok(html.includes('stroke:var(--muted)'), 'stroke mapped');
  assert.ok(html.includes('fill:var(--ink)'), 'fill mapped');
  assert.ok(!html.includes('fontFamily'), 'font left to the stylesheet');
});
