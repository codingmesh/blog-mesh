import { pageSignal } from './page.ts';

/**
 * Figures open in a dialog at full size. The image morphs from its place on the page with a view transition when
 * the browser supports it and the reader has not asked for reduced motion.
 */
export function initLightbox(dialog = document.querySelector<HTMLDialogElement>('#lightbox')) {
  if (!dialog) return;
  const image = dialog.querySelector('img');
  const caption = dialog.querySelector('figcaption');
  if (!image || !caption) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let source: HTMLImageElement | null = null;

  // Only one element may carry the name at a time, so it passes from the image leaving to the image arriving
  // inside the change; both having it would abort the transition. While the morph runs, the page's other named
  // groups (header, footer, title) are silenced by the figure-morph class so they stay under the backdrop; the
  // images name themselves with an important style to win over that rule.
  const name = (element: HTMLImageElement, value: string) =>
    value
      ? element.style.setProperty('view-transition-name', value, 'important')
      : element.style.removeProperty('view-transition-name');
  const transition = (from: HTMLImageElement, to: HTMLImageElement, change: () => void) => {
    const move = () => {
      change();
      name(from, '');
      name(to, 'figure');
    };
    if (reduced.matches || !document.startViewTransition) {
      move();
      name(to, '');
      return;
    }
    const root = document.documentElement;
    root.classList.add('figure-morph');
    name(from, 'figure');
    document.startViewTransition(move).finished.finally(() => {
      name(to, '');
      root.classList.remove('figure-morph');
    });
  };
  const open = (link: HTMLAnchorElement) => {
    source = link.querySelector('img');
    if (!source) return;
    image.src = link.href;
    image.alt = source.alt;
    caption.textContent = link.parentElement?.querySelector('figcaption')?.textContent ?? '';
    transition(source, image, () => dialog.showModal());
  };
  const close = () => {
    if (!source) {
      dialog.close();
      return;
    }
    transition(image, source, () => dialog.close());
  };

  const signal = pageSignal('lightbox');
  // Capture phase, so the click is claimed before the client router treats the link as a navigation.
  document.addEventListener(
    'click',
    (event) => {
      const link = (event.target as Element).closest<HTMLAnchorElement>('.figure-link');
      if (!link || event.metaKey || event.ctrlKey || event.button !== 0) return;
      event.preventDefault();
      open(link);
    },
    { signal, capture: true },
  );
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog || (event.target as Element).closest('.lightbox-close')) close();
  });
  dialog.addEventListener('cancel', (event) => {
    event.preventDefault();
    close();
  });
}
