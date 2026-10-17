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

  const transition = (change: () => void) => {
    if (reduced.matches || !document.startViewTransition) {
      change();
      return;
    }
    if (source) source.style.viewTransitionName = 'figure';
    document.startViewTransition(change).finished.finally(() => {
      if (source) source.style.viewTransitionName = '';
    });
  };
  const open = (link: HTMLAnchorElement) => {
    source = link.querySelector('img');
    if (!source) return;
    image.src = link.href;
    image.alt = source.alt;
    caption.textContent = link.parentElement?.querySelector('figcaption')?.textContent ?? '';
    transition(() => dialog.showModal());
  };
  const close = () => transition(() => dialog.close());

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
