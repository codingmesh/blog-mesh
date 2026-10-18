/** The rail's share actions: copy the article's link, or its Markdown source fetched from the site. */
export function initShare(root: ParentNode = document) {
  root.querySelectorAll<HTMLButtonElement>('[data-share]').forEach((button) => {
    if (button.dataset.ready) return;
    button.dataset.ready = '';
    const label = button.textContent?.trim() ?? '';
    let timer: ReturnType<typeof setTimeout>;
    const done = (text: string) => {
      clearTimeout(timer);
      button.textContent = text;
      button.classList.toggle('is-done', text === 'Copied');
      timer = setTimeout(() => {
        button.textContent = label;
        button.classList.remove('is-done');
      }, 2000);
    };
    button.addEventListener('click', async () => {
      try {
        const text =
          button.dataset.share === 'markdown' && button.dataset.href
            ? await fetch(button.dataset.href).then((response) => {
                if (!response.ok) throw new Error(String(response.status));
                return response.text();
              })
            : location.origin + location.pathname;
        await navigator.clipboard.writeText(text);
        done('Copied');
      } catch {
        done('Copy unavailable');
      }
    });
  });
}
