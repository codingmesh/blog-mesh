/** Topic filtering for the archive. The pure part is tested; the DOM part keeps URL state in sync. */
export type Tagged = { tags: string[] };

/** Which items stay visible for a topic. An empty topic shows everything. */
export function filterByTag<T extends Tagged>(items: T[], tag: string): boolean[] {
  return items.map((item) => !tag || item.tags.includes(tag));
}

export function filterStatus(tag: string, visible: number) {
  const noun = visible === 1 ? 'article' : 'articles';
  return { count: String(visible), noun, status: `${tag || 'All topics'}: ${visible} ${noun}` };
}

export function emptyMessage(tag: string) {
  return tag ? `No articles about “${tag}” yet.` : 'New articles are on the way.';
}

export function initTopicFilters() {
  const buttons = document.querySelectorAll<HTMLButtonElement>('[data-tag]');
  const items = [...document.querySelectorAll<HTMLElement>('[data-tags]')];
  const count = document.querySelector('#post-count');
  const noun = document.querySelector('#post-noun');
  const status = document.querySelector('#filter-status');
  const empty = document.querySelector<HTMLElement>('#filter-empty');
  const emptyText = document.querySelector('#filter-empty-message');
  if (!buttons.length || !count || !noun || !status || !empty || !emptyText) return;
  const tagsOf = items.map((item) => ({ tags: JSON.parse(item.dataset.tags || '[]') as string[] }));

  function apply(tag: string) {
    const visibility = filterByTag(tagsOf, tag);
    items.forEach((item, index) => {
      item.hidden = !visibility[index];
    });
    document.querySelectorAll<HTMLElement>('.archive-group').forEach((group) => {
      group.hidden = !group.querySelector('.archive-item:not([hidden])');
    });
    buttons.forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.tag === tag)));
    const visible = visibility.filter(Boolean).length;
    const text = filterStatus(tag, visible);
    count!.textContent = text.count;
    noun!.textContent = text.noun;
    status!.textContent = text.status;
    empty!.hidden = visible > 0;
    emptyText!.textContent = emptyMessage(tag);
  }
  const currentTag = () => new URL(location.href).searchParams.get('tag') || '';
  function select(tag: string) {
    if (tag === currentTag()) return;
    const url = new URL(location.href);
    if (tag) url.searchParams.set('tag', tag);
    else url.searchParams.delete('tag');
    history.pushState({}, '', url);
    apply(tag);
  }
  buttons.forEach((button) => button.addEventListener('click', () => select(button.dataset.tag || '')));
  document.querySelector('#filter-reset')?.addEventListener('click', () => select(''));
  window.addEventListener('popstate', () => apply(currentTag()));
  apply(currentTag());
}
