/** Folds long model turns and copies the prompt (the user's turns) from a transcript. */
const FOLD_AT = 360;

export function promptText(transcript: Element) {
  return [...transcript.querySelectorAll<HTMLElement>('.turn-user .turn-body')]
    .map((body) => body.innerText.trim())
    .filter(Boolean)
    .join('\n\n');
}

export function initTranscripts(root: ParentNode = document) {
  root.querySelectorAll<HTMLElement>('.transcript').forEach((transcript) => {
    if (transcript.dataset.ready) return;
    transcript.dataset.ready = '';
    const model = transcript.dataset.model || 'Model';
    transcript.querySelectorAll<HTMLElement>('.turn-model .turn-role').forEach((role) => {
      if (!role.textContent?.trim()) role.textContent = model;
    });

    transcript.querySelectorAll<HTMLElement>('.turn-model .turn-body').forEach((body) => {
      if (body.scrollHeight <= FOLD_AT + 80) return;
      body.classList.add('is-folded');
      const more = document.createElement('button');
      more.type = 'button';
      more.className = 'turn-more';
      more.textContent = 'Show the rest';
      more.setAttribute('aria-expanded', 'false');
      more.addEventListener('click', () => {
        const folded = body.classList.toggle('is-folded');
        more.textContent = folded ? 'Show the rest' : 'Show less';
        more.setAttribute('aria-expanded', String(!folded));
      });
      body.after(more);
    });

    const copy = transcript.querySelector<HTMLButtonElement>('.transcript-copy');
    if (!copy) return;
    let timer: ReturnType<typeof setTimeout>;
    copy.addEventListener('click', async () => {
      clearTimeout(timer);
      try {
        await navigator.clipboard.writeText(promptText(transcript));
        copy.textContent = 'Copied';
        copy.classList.add('is-done');
      } catch {
        copy.textContent = 'Copy unavailable';
      }
      timer = setTimeout(() => {
        copy.textContent = 'Copy prompt';
        copy.classList.remove('is-done');
      }, 2000);
    });
  });
}
