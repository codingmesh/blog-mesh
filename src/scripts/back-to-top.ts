import { pageSignal } from './page.ts';

/** Shows the back-to-top control once the reader is more than a screen down the page. */
export function shouldShowBackToTop(scrollY: number, viewport: number) {
  return scrollY > viewport;
}

export function initBackToTop() {
  const signal = pageSignal('to-top');
  const control = document.querySelector<HTMLElement>('.to-top');
  if (!control) return;
  const update = () => control.toggleAttribute('data-visible', shouldShowBackToTop(window.scrollY, window.innerHeight));
  window.addEventListener('scroll', update, { passive: true, signal });
  update();
}
