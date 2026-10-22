import { pageSignal } from './page.ts';

/** Ambient videos play while on screen and pause when scrolled away; never under reduced motion. */
export function initAmbientVideo(root: ParentNode = document) {
  const videos = [...root.querySelectorAll<HTMLVideoElement>('video[data-ambient]')];
  if (!videos.length) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const signal = pageSignal('ambient-video');
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const video = entry.target as HTMLVideoElement;
        if (entry.isIntersecting) video.play().catch(() => undefined);
        else video.pause();
      }
    },
    { threshold: 0.4 },
  );
  // Follows the reader's motion setting as it changes, not only as it was when the page loaded.
  const sync = () => {
    if (reduced.matches) {
      observer.disconnect();
      videos.forEach((video) => video.pause());
    } else videos.forEach((video) => observer.observe(video));
  };
  reduced.addEventListener('change', sync, { signal });
  signal.addEventListener('abort', () => observer.disconnect());
  sync();
}
