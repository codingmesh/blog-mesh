import { pageSignal } from './page.ts';

/** How far through the body the reader is, from 0 to 1, given the body's position and height. */
export function readingProgress(top: number, height: number, viewport: number) {
  const scrollable = height - viewport;
  if (scrollable <= 0) return 1;
  return Math.min(1, Math.max(0, -top / scrollable));
}

/** Fills the ink line at the top of an article, and the rail's dotted bar and percentage, as the reader moves. */
export function initReadingLine() {
  const signal = pageSignal('reading-line');
  const line = document.querySelector<HTMLElement>('.read-line span');
  const body = document.querySelector<HTMLElement>('.prose');
  if (!body) return;
  const bar = document.querySelector<HTMLElement>('.toc-bar');
  const percent = document.querySelector<HTMLElement>('.toc-pct');
  let scheduled = false;
  const update = () => {
    const rect = body.getBoundingClientRect();
    const progress = readingProgress(rect.top, rect.height, window.innerHeight);
    if (line) line.style.transform = `scaleX(${progress})`;
    if (bar) bar.style.setProperty('--read-progress', `${Math.round(progress * 100)}%`);
    if (percent) percent.textContent = `${Math.round(progress * 100)}%`;
  };
  const schedule = () => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      update();
      scheduled = false;
    });
  };
  window.addEventListener('scroll', schedule, { passive: true, signal });
  window.addEventListener('resize', schedule, { passive: true, signal });
  update();
}
