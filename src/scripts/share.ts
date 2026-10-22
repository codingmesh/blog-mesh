import { announce } from './announce.ts';

/**
 * Writes text that is still being fetched. Safari forgets the click once a fetch has finished, so the clipboard
 * is handed the pending text inside the gesture where the browser allows it, and the plain call is the fallback.
 */
async function writePending(pending: Promise<string>) {
  if (typeof ClipboardItem === 'function' && navigator.clipboard.write) {
    try {
      const blob = pending.then((text) => new Blob([text], { type: 'text/plain' }));
      await navigator.clipboard.write([new ClipboardItem({ 'text/plain': blob })]);
      return;
    } catch {}
  }
  await navigator.clipboard.writeText(await pending);
}

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
      announce(text === 'Copied' ? `${label}: copied.` : `${label}: copying is unavailable.`);
      timer = setTimeout(() => {
        button.textContent = label;
        button.classList.remove('is-done');
      }, 2000);
    };
    button.addEventListener('click', async () => {
      try {
        if (button.dataset.share === 'markdown' && button.dataset.href) {
          await writePending(
            fetch(button.dataset.href).then((response) => {
              if (!response.ok) throw new Error(String(response.status));
              return response.text();
            }),
          );
        } else await navigator.clipboard.writeText(location.origin + location.pathname);
        done('Copied');
      } catch {
        done('Copy unavailable');
      }
    });
  });
}
