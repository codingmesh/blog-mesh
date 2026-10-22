import { navigate } from 'astro:transitions/client';

/**
 * Single-key navigation, shown as hints in the header: W writing, N notes, A about, S search, T theme.
 * Ignored while typing, while a dialog is open, and with any modifier held, so it never fights the browser.
 */
const routes: Record<string, string> = { w: '/writing/', n: '/notes/', a: '/about/' };

const isTyping = (target: EventTarget | null) =>
  target instanceof Element &&
  (!!target.closest('input, textarea, select, [contenteditable="true"]') || (target as HTMLElement).isContentEditable);

const KEY = 'shortcuts';

/** Readers can turn the single-key shortcuts off on the About page; the choice is kept in local storage. */
export function shortcutsEnabled() {
  try {
    return localStorage.getItem(KEY) !== 'off';
  } catch {
    return true;
  }
}
export function setShortcutsEnabled(on: boolean) {
  try {
    if (on) localStorage.removeItem(KEY);
    else localStorage.setItem(KEY, 'off');
  } catch {}
  reflect();
}
/** The header hides its key hints while shortcuts are off. */
function reflect() {
  document.documentElement.dataset.shortcuts = shortcutsEnabled() ? 'on' : 'off';
}

let bound = false;
export function initShortcuts() {
  // The router swaps the root attributes on every navigation, so the state is written back each time.
  reflect();
  if (bound) return;
  bound = true;
  document.addEventListener('keydown', (event) => {
    if (!shortcutsEnabled()) return;
    if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey || event.repeat) return;
    if (event.isComposing || isTyping(event.target)) return;
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
