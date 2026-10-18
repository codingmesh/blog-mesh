/**
 * Theme toggle. A stored choice wins, then the system preference, then light; the pre-paint choice lives in an
 * inline script in Base.astro with the same rule. This module wires the button, re-applies the theme after
 * client-side navigation, and announces changes for anything that needs to follow (comments embed).
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
    button.title = label;
  }
  document.dispatchEvent(new CustomEvent<Theme>('themechange', { detail: theme }));
}

/** Switches theme as an ink wipe spreading from the toggle; a plain swap where the API or the reader's settings say no. */
function switchTheme(next: Theme, origin: HTMLElement) {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const root = document.documentElement;
  if (reduced || typeof document.startViewTransition !== 'function') {
    applyTheme(next);
    return;
  }
  const rect = origin.getBoundingClientRect();
  const x = rect.left + rect.width / 2;
  const y = rect.top + rect.height / 2;
  const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
  root.classList.add('theme-wipe');
  const transition = document.startViewTransition(() => applyTheme(next));
  transition.ready
    .then(() =>
      root.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
        { duration: 520, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)', pseudoElement: '::view-transition-new(root)' },
      ),
    )
    .catch(() => {});
  transition.finished.finally(() => root.classList.remove('theme-wipe'));
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
