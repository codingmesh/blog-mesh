import { pageSignal } from './page.ts';

/** Fills the ink line at the top of an article as the reader moves through the body. */
export function readingProgress(top: number, height: number, viewport: number) {
  const scrollable = height - viewport;
  if (scrollable <= 0) return 1;
  return Math.min(1, Math.max(0, -top / scrollable));
}

export function initReadingLine() {
  const line = document.querySelector<HTMLElement>('.read-line span');
  const body = document.querySelector<HTMLElement>('.prose');
  if (!line || !body) return;
  const signal = pageSignal('reading-line');
  let scheduled = false;
  const update = () => {
    const rect = body.getBoundingClientRect();
    line.style.transform = `scaleX(${readingProgress(rect.top, rect.height, window.innerHeight)})`;
  };
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
    { passive: true, signal },
  );
  window.addEventListener('resize', update, { passive: true, signal });
  update();
}
