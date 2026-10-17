import { pageSignal } from './page.ts';

/** Marks the table-of-contents link for the heading nearest the top of the viewport. */
export function initTableOfContents(selector = '.article-toc a') {
  const links = [...document.querySelectorAll<HTMLAnchorElement>(selector)];
  const headings = links
    .map((link) => document.getElementById(decodeURIComponent(link.hash.slice(1))))
    .filter((heading): heading is HTMLElement => !!heading);
  if (!headings.length) return;
  const update = () => {
    let current = headings[0].id;
    for (const heading of headings) if (heading.getBoundingClientRect().top <= 150) current = heading.id;
    links.forEach((link) => {
      if (decodeURIComponent(link.hash.slice(1)) === current) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  };
  let scheduled = false;
  window.addEventListener(
    'scroll',
    () => {
      if (scheduled) return;
      scheduled = true;
      requestAnimationFrame(() => {
        update();
        scheduled = false;
      });
    },
    { passive: true, signal: pageSignal('toc') },
  );
  update();
}
