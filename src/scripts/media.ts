import { pageSignal } from './page.ts';

/** Ambient videos play while on screen and pause when scrolled away; never under reduced motion. */
export function initAmbientVideo(root: ParentNode = document) {
  const videos = [...root.querySelectorAll<HTMLVideoElement>('video[data-ambient]')];
  if (!videos.length || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
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
  videos.forEach((video) => observer.observe(video));
  pageSignal('ambient-video').addEventListener('abort', () => observer.disconnect());
}
