/**
 * Speaks a short message through the page's polite live region. The region is emptied first and filled on the
 * next frame, so repeating the same message (a second copy of the same block) is announced again.
 */
export function announce(text: string, region = document.querySelector<HTMLElement>('#copy-status')) {
  if (!region) return;
  region.textContent = '';
  requestAnimationFrame(() => {
    region.textContent = text;
  });
}
