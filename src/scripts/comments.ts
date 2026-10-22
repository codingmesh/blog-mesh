import { pageSignal } from './page.ts';
import { currentTheme } from './theme.ts';

/**
 * Mounts the giscus comments embed after the page is ready. The script is injected here rather than written in
 * the markup so the client router does not wait for giscus before it runs the rest of the page setup, and so
 * the embed starts in the reader's current theme instead of a fixed one.
 */
export function initComments(section = document.querySelector<HTMLElement>('.comments[data-giscus-repo]')) {
  const signal = pageSignal('comments');
  if (!section || section.querySelector('script')) return;
  const settings: Record<string, string | undefined> = {
    repo: section.dataset.giscusRepo,
    'repo-id': section.dataset.giscusRepoId,
    category: section.dataset.giscusCategory,
    'category-id': section.dataset.giscusCategoryId,
    mapping: 'pathname',
    strict: '1',
    'reactions-enabled': '1',
    'emit-metadata': '0',
    'input-position': 'top',
    theme: currentTheme(),
    lang: 'en',
    loading: 'lazy',
  };
  const script = document.createElement('script');
  for (const [key, value] of Object.entries(settings)) if (value) script.setAttribute(`data-${key}`, value);
  script.src = 'https://giscus.app/client.js';
  script.crossOrigin = 'anonymous';
  script.async = true;
  section.append(script);
  // Keep the embed in step with the site theme.
  document.addEventListener(
    'themechange',
    (event) => {
      const frame = section.querySelector<HTMLIFrameElement>('iframe.giscus-frame');
      const theme = (event as CustomEvent<string>).detail;
      frame?.contentWindow?.postMessage({ giscus: { setConfig: { theme } } }, 'https://giscus.app');
    },
    { signal },
  );
}
