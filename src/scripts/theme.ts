/**
 * Theme toggle. A stored choice wins, then the system preference, then light; the pre-paint choice lives in an
 * inline script in Base.astro with the same rule. This module wires the button, re-applies the theme after
 * client-side navigation, and announces changes for anything that needs to follow (the wind, for one).
 */
export type Theme = 'light' | 'dark';

export function currentTheme(): Theme {
  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
}

export function storedTheme(): Theme {
  let preference: string | null = null;
  try {
    preference = localStorage.getItem('theme');
  } catch {}
  if (preference === 'dark' || preference === 'light') return preference;
  return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
  if (meta) meta.content = meta.dataset[theme] || meta.content;
  const button = document.querySelector<HTMLButtonElement>('#theme-toggle');
  if (button) {
    const label = theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';
    button.setAttribute('aria-label', label);
    button.title = `${label} (T)`;
  }
  document.dispatchEvent(new CustomEvent<Theme>('themechange', { detail: theme }));
}

/** Switches theme as an ink wipe spreading from the toggle; a plain swap where the API or the reader's settings say no. */
let wipe = 0;
function switchTheme(next: Theme, origin: HTMLElement) {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const root = document.documentElement;
  if (reduced || typeof document.startViewTransition !== 'function') {
    // A plain swap: hold link and button transitions for a frame so everything changes together.
    root.classList.add('theme-swap');
    applyTheme(next);
    requestAnimationFrame(() => requestAnimationFrame(() => root.classList.remove('theme-swap')));
    return;
  }
  const rect = origin.getBoundingClientRect();
  const x = rect.left + rect.width / 2;
  const y = rect.top + rect.height / 2;
  const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
  root.classList.add('theme-wipe');
  // A second toggle during the wipe starts a new transition; only the latest one may take the class off.
  const token = ++wipe;
  const transition = document.startViewTransition(() => applyTheme(next));
  // A circle's area grows with the square of its radius, so a gentle ease-out keeps the reveal at an even pace
  // from the corner to the far side of the page instead of finishing in a rush.
  transition.ready
    .then(() =>
      root.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
        { duration: 900, easing: 'cubic-bezier(0.3, 0.1, 0.3, 1)', pseudoElement: '::view-transition-new(root)' },
      ),
    )
    .catch(() => {});
  transition.finished.finally(() => {
    if (token === wipe) root.classList.remove('theme-wipe');
  });
}

export function initThemeToggle() {
  const button = document.querySelector<HTMLButtonElement>('#theme-toggle');
  if (!button) return;
  button.addEventListener('click', () => {
    const next: Theme = currentTheme() === 'dark' ? 'light' : 'dark';
    switchTheme(next, button);
    try {
      localStorage.setItem('theme', next);
    } catch {}
  });
  applyTheme(currentTheme());
}

// The client router swaps the root element's attributes; restore the stored theme before the new page paints.
document.addEventListener('astro:after-swap', () => applyTheme(storedTheme()));
// Readers who have not chosen follow the system, including when it changes while they read.
matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
  let chosen: string | null = null;
  try {
    chosen = localStorage.getItem('theme');
  } catch {}
  if (chosen !== 'dark' && chosen !== 'light') applyTheme(storedTheme());
});
