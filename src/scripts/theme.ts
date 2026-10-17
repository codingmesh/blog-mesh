/**
 * Theme toggle. Light is the default; the pre-paint choice lives in an inline script in Base.astro.
 * This module wires the button, re-applies the stored theme after client-side navigation,
 * and announces changes for anything that needs to follow (comments embed).
 */
export type Theme = 'light' | 'dark';

export function currentTheme(): Theme {
  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
}

export function storedTheme(): Theme {
  try {
    return localStorage.getItem('theme') === 'dark' ? 'dark' : 'light';
  } catch {
    return 'light';
  }
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

export function initThemeToggle() {
  const button = document.querySelector<HTMLButtonElement>('#theme-toggle');
  if (!button) return;
  button.addEventListener('click', () => {
    const next: Theme = currentTheme() === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    try {
      localStorage.setItem('theme', next);
    } catch {}
  });
  applyTheme(currentTheme());
}

// The client router swaps the root element's attributes; restore the stored theme before the new page paints.
document.addEventListener('astro:after-swap', () => applyTheme(storedTheme()));
