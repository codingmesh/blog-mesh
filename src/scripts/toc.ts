import { pageSignal } from './page.ts';

/** Marks the table-of-contents link for the heading nearest the top of the viewport and slides the marker to it. */
export function initTableOfContents(selector = '.article-toc a') {
  const links = [...document.querySelectorAll<HTMLAnchorElement>(selector)];
  const headings = links
    .map((link) => document.getElementById(decodeURIComponent(link.hash.slice(1))))
    .filter((heading): heading is HTMLElement => !!heading);
  if (!headings.length) return;
  const list = links[0].closest<HTMLElement>('ol');
  const update = () => {
    let current = headings[0].id;
    for (const heading of headings) if (heading.getBoundingClientRect().top <= 150) current = heading.id;
    // At the end of the page the last section is current even if its heading never reaches the top.
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2)
      current = headings[headings.length - 1].id;
    links.forEach((link) => {
      const active = decodeURIComponent(link.hash.slice(1)) === current;
      if (active) {
        link.setAttribute('aria-current', 'location');
        if (list) {
          list.style.setProperty('--toc-top', `${link.offsetTop}px`);
          list.style.setProperty('--toc-height', `${link.offsetHeight}px`);
        }
      } else link.removeAttribute('aria-current');
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
