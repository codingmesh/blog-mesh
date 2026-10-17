import { highlightRanges, matchIndex, type IndexEntry } from './search-match';

type SearchData = { url: string; meta: { title?: string; description?: string }; excerpt: string };
type Pagefind = { search: (query: string) => Promise<{ results: { data: () => Promise<SearchData> }[] }> };

// The shortcut is bound once for the whole session and always targets the dialog on the current page.
let shortcutBound = false;
function bindShortcut() {
  if (shortcutBound) return;
  shortcutBound = true;
  document.addEventListener('keydown', (event) => {
    if (!(event.metaKey || event.ctrlKey) || event.key.toLowerCase() !== 'k') return;
    event.preventDefault();
    const dialog = document.querySelector<HTMLDialogElement>('#search-dialog');
    if (!dialog) return;
    if (dialog.open) dialog.close();
    else document.querySelector<HTMLButtonElement>('#search-open')?.click();
  });
}

export function initSearch() {
  bindShortcut();
  const dialog = document.querySelector<HTMLDialogElement>('#search-dialog');
  const input = document.querySelector<HTMLInputElement>('#search-input');
  const status = document.querySelector<HTMLElement>('#search-status');
  const list = document.querySelector<HTMLElement>('#search-results');
  const suggestions = document.querySelector<HTMLElement>('#search-suggestions');
  const recovery = document.querySelector<HTMLElement>('#search-recovery');
  const retry = document.querySelector<HTMLButtonElement>('#search-retry');
  const mode = document.querySelector<HTMLElement>('#search-mode');
  const openButton = document.querySelector<HTMLButtonElement>('#search-open');
  if (!dialog || !input || !status || !list || !suggestions || !recovery || !retry || !mode || !openButton) return;

  let timer: ReturnType<typeof setTimeout>;
  let requestId = 0;
  let engine: Promise<Pagefind> | undefined;
  let index: Promise<IndexEntry[]> | undefined;
  let previousFocus: HTMLElement | null = null;

  function open() {
    if (dialog!.open) return;
    previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : openButton;
    dialog!.showModal();
    input!.focus();
    input!.select();
    if (input!.value.trim()) queueSearch();
  }
  const close = () => dialog!.close();
  openButton.addEventListener('click', open);
  document.querySelector('#search-close')?.addEventListener('click', close);
  dialog.addEventListener('cancel', (event) => {
    event.preventDefault();
    close();
  });
  dialog.addEventListener('close', () => {
    clearTimeout(timer);
    requestId++;
    list!.removeAttribute('aria-busy');
    previousFocus?.focus({ preventScroll: true });
  });
  dialog.addEventListener('click', (event) => {
    if (event.target !== dialog) return;
    const rect = dialog!.getBoundingClientRect();
    if (
      event.clientX < rect.left ||
      event.clientX > rect.right ||
      event.clientY < rect.top ||
      event.clientY > rect.bottom
    )
      close();
  });
  // Results stay ordinary links: Tab, Enter, and modifier-click keep native behavior. Arrows move focus.
  dialog.addEventListener('keydown', (event) => {
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
    const links = [...list!.querySelectorAll<HTMLAnchorElement>('a')];
    if (!links.length) return;
    const current = links.indexOf(document.activeElement as HTMLAnchorElement);
    if (document.activeElement !== input && current === -1) return;
    event.preventDefault();
    const next = event.key === 'ArrowDown' ? current + 1 : current - 1;
    if (next < 0 || next >= links.length) input!.focus();
    else links[next].focus();
  });

  function highlight(element: HTMLElement, text: string, query: string) {
    let cursor = 0;
    for (const range of highlightRanges(text, query)) {
      element.append(document.createTextNode(text.slice(cursor, range.start)));
      const mark = document.createElement('mark');
      mark.textContent = text.slice(range.start, range.end);
      element.append(mark);
      cursor = range.end;
    }
    element.append(document.createTextNode(text.slice(cursor)));
  }

  async function search(query: string) {
    try {
      if (import.meta.env.DEV) throw new Error('Use the metadata index in development');
      const path = '/pagefind/pagefind.js';
      engine ??= import(/* @vite-ignore */ path) as Promise<Pagefind>;
      const result = await (await engine).search(query);
      return {
        total: result.results.length,
        data: await Promise.all(result.results.slice(0, 8).map((item) => item.data())),
        fallback: false,
      };
    } catch {
      engine = undefined;
      index ??= fetch('/search-index.json')
        .then((response) => {
          if (!response.ok) throw new Error('Search index unavailable');
          return response.json() as Promise<IndexEntry[]>;
        })
        .catch((error) => {
          index = undefined;
          throw error;
        });
      const matches = matchIndex(query, await index);
      return {
        total: matches.length,
        data: matches
          .slice(0, 8)
          .map((item) => ({ url: item.url, meta: { title: item.title }, excerpt: item.description })),
        fallback: true,
      };
    }
  }

  function queueSearch() {
    clearTimeout(timer);
    const current = ++requestId;
    const query = input!.value.trim();
    list!.replaceChildren();
    list!.hidden = true;
    recovery!.hidden = true;
    suggestions!.hidden = !!query;
    if (!query) {
      status!.textContent = 'Enter a keyword to search all writing and notes.';
      list!.removeAttribute('aria-busy');
      return;
    }
    status!.textContent = 'Searching…';
    list!.setAttribute('aria-busy', 'true');
    timer = setTimeout(async () => {
      try {
        const result = await search(query);
        if (current !== requestId || !dialog!.open) return;
        mode!.textContent = result.fallback ? 'Title and summary search' : 'Full-text search';
        status!.textContent = result.total
          ? `${result.total} ${result.total === 1 ? 'result' : 'results'}${result.total > 8 ? ', showing the first 8' : ''}`
          : `No results for “${query}”. Try another keyword or browse all writing.`;
        if (!result.total) {
          recovery!.hidden = false;
          retry!.hidden = true;
          suggestions!.hidden = false;
        }
        list!.hidden = result.data.length === 0;
        for (const item of result.data) {
          const li = document.createElement('li');
          const link = document.createElement('a');
          link.href = item.url;
          const title = document.createElement('strong');
          highlight(title, item.meta.title || 'Read article', query);
          const excerpt = document.createElement('span');
          const text = result.fallback
            ? item.excerpt
            : new DOMParser().parseFromString(item.excerpt, 'text/html').body.textContent || '';
          const description = 'description' in item.meta ? item.meta.description : undefined;
          highlight(
            excerpt,
            description && item.meta.title && text.includes(item.meta.title) ? description : text,
            query,
          );
          link.append(title, excerpt);
          li.append(link);
          list!.append(li);
        }
      } catch {
        if (current !== requestId || !dialog!.open) return;
        status!.textContent = 'Search could not load. Please try again or browse all writing.';
        recovery!.hidden = false;
        retry!.hidden = false;
      } finally {
        if (current === requestId) list!.removeAttribute('aria-busy');
      }
    }, 180);
  }
  input.addEventListener('input', (event) => {
    if (!(event instanceof InputEvent && event.isComposing)) queueSearch();
  });
  input.addEventListener('compositionend', queueSearch);
  retry.addEventListener('click', queueSearch);
  document.querySelectorAll<HTMLButtonElement>('[data-search-topic]').forEach((button) =>
    button.addEventListener('click', () => {
      input!.value = button.dataset.searchTopic || '';
      input!.focus();
      queueSearch();
    }),
  );
}
