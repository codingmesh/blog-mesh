/**
 * Theme toggle. The pre-paint default lives in an inline script in Base.astro;
 * this module wires the button and announces changes for anything that needs to follow (comments embed).
 */
export type Theme = 'light' | 'dark';

export function currentTheme(): Theme {
  return document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
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
    const next: Theme = currentTheme() === 'light' ? 'dark' : 'light';
    applyTheme(next);
    try {
      localStorage.setItem('theme', next);
    } catch {}
  });
  applyTheme(currentTheme());
}
