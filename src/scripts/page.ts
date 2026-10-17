/**
 * Runs page-level setup after every navigation. With Astro's client router, component scripts execute once,
 * so each component registers its init here instead of calling it at module load.
 * `astro:page-load` also fires on the first load, so nothing runs twice.
 */
export function onPageLoad(init: () => void) {
  document.addEventListener('astro:page-load', init);
}

/** One AbortController per page for window or document listeners that must not pile up across navigations. */
const controllers = new Map<string, AbortController>();
export function pageSignal(key: string): AbortSignal {
  controllers.get(key)?.abort();
  const controller = new AbortController();
  controllers.set(key, controller);
  return controller.signal;
}
