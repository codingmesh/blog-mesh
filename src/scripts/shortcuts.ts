import { navigate } from 'astro:transitions/client';

/**
 * Single-key navigation, shown as hints in the header: W writing, N notes, A about, S search, T theme.
 * Ignored while typing, while a dialog is open, and with any modifier held, so it never fights the browser.
 */
const routes: Record<string, string> = { w: '/writing/', n: '/notes/', a: '/about/' };

const isTyping = (target: EventTarget | null) =>
  target instanceof Element &&
  (!!target.closest('input, textarea, select, [contenteditable="true"]') || (target as HTMLElement).isContentEditable);

let bound = false;
export function initShortcuts() {
  if (bound) return;
  bound = true;
  document.addEventListener('keydown', (event) => {
    if (event.metaKey || event.ctrlKey || event.altKey || event.isComposing || isTyping(event.target)) return;
    if (document.querySelector('dialog[open]')) return;
    const key = event.key.toLowerCase();
    if (routes[key]) {
      event.preventDefault();
      navigate(routes[key]);
    } else if (key === 's') {
      event.preventDefault();
      document.querySelector<HTMLButtonElement>('#search-open')?.click();
    } else if (key === 't') {
      event.preventDefault();
      document.querySelector<HTMLButtonElement>('#theme-toggle')?.click();
    }
  });
}
