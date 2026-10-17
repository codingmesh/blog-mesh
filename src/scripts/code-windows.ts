/**
 * Builds the code panel chrome around every highlighted block: a tab, wrap and copy controls, folding for long
 * blocks, and copy feedback. Line numbers, highlights, notes, and captions are already in the HTML from the
 * Shiki transformer, so the panel reads correctly without JavaScript.
 */
const languageLabels: Record<string, string> = {
  typescript: 'TypeScript',
  ts: 'TypeScript',
  javascript: 'JavaScript',
  js: 'JavaScript',
  tsx: 'TSX',
  jsx: 'JSX',
  bash: 'Shell',
  shell: 'Shell',
  sh: 'Shell',
  zsh: 'Shell',
  python: 'Python',
  json: 'JSON',
  css: 'CSS',
  html: 'HTML',
  astro: 'Astro',
  yaml: 'YAML',
  yml: 'YAML',
  md: 'Markdown',
  mdx: 'MDX',
};

const FOLD_AFTER = 24;

export function languageLabel(language: string) {
  return languageLabels[language] || language || 'Code';
}

/**
 * The text a reader expects to copy: the lines only, never the inline notes. In a terminal block, only the
 * commands, without their prompts.
 */
export function codeText(code: HTMLElement) {
  const commands = [...code.querySelectorAll<HTMLElement>('.line.command .command-text')];
  if (commands.length) return commands.map((command) => command.textContent ?? '').join('\n');
  const lines = [...code.querySelectorAll<HTMLElement>('.line')];
  return lines.length ? lines.map((line) => line.textContent ?? '').join('\n') : (code.textContent ?? '');
}

const icon = (path: string) =>
  `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${path}"/></svg>`;
const icons = {
  copy: icon('M9 9h10v12H9zM5 15V3h10'),
  check: icon('m5 12 5 5L20 7'),
  wrap: icon('M4 6h16M4 12h10a3 3 0 0 1 0 6h-2m0 0 2-2m-2 2 2 2M4 18h5'),
};

export function initCodeWindows(
  root: ParentNode = document,
  status = document.querySelector<HTMLElement>('#copy-status'),
) {
  root.querySelectorAll<HTMLPreElement>('.prose pre').forEach((pre, index) => {
    const code = pre.querySelector('code');
    if (!code || pre.parentElement?.classList.contains('code-block')) return;
    const language = pre.dataset.language || code.dataset.language || '';
    const lineCount = Number(pre.dataset.lines || code.querySelectorAll('.line').length);

    const shell = document.createElement('div');
    shell.className = 'code-block';
    const bar = document.createElement('div');
    bar.className = 'code-bar';
    bar.setAttribute('data-pagefind-ignore', '');

    const tab = document.createElement('span');
    tab.className = pre.dataset.title ? 'code-tab has-title' : 'code-tab';
    tab.innerHTML = pre.dataset.title ? `<b></b><small></small>` : `<b></b>`;
    const primary = tab.querySelector('b')!;
    const terminal = 'terminal' in pre.dataset;
    primary.textContent = pre.dataset.title || (terminal ? 'Terminal' : languageLabel(language));
    if (pre.dataset.title) tab.querySelector('small')!.textContent = terminal ? 'Terminal' : languageLabel(language);

    const tools = document.createElement('div');
    tools.className = 'code-tools';

    const wrapButton = document.createElement('button');
    wrapButton.type = 'button';
    wrapButton.className = 'code-tool';
    wrapButton.innerHTML = `${icons.wrap}<span>Wrap</span>`;
    wrapButton.setAttribute('aria-pressed', String('wrap' in pre.dataset));
    wrapButton.setAttribute('aria-label', `Toggle line wrapping for code block ${index + 1}`);
    wrapButton.addEventListener('click', () => {
      const on = pre.toggleAttribute('data-wrap');
      wrapButton.setAttribute('aria-pressed', String(on));
    });

    const copyButton = document.createElement('button');
    copyButton.type = 'button';
    copyButton.className = 'code-tool code-copy';
    copyButton.innerHTML = `${icons.copy}<span>Copy</span>`;
    copyButton.setAttribute(
      'aria-label',
      terminal ? `Copy the commands of block ${index + 1}` : `Copy code block ${index + 1}`,
    );
    let timer: ReturnType<typeof setTimeout>;
    copyButton.addEventListener('click', async () => {
      clearTimeout(timer);
      try {
        await navigator.clipboard.writeText(codeText(code));
        copyButton.innerHTML = `${icons.check}<span>Copied</span>`;
        copyButton.classList.add('is-done');
        code.classList.remove('flash');
        void code.offsetWidth;
        code.classList.add('flash');
        if (status) status.textContent = `Code block ${index + 1} copied.`;
      } catch {
        const range = document.createRange();
        range.selectNodeContents(code);
        const selection = window.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(range);
        pre.focus();
        copyButton.innerHTML = `${icons.copy}<span>Selected</span>`;
        if (status)
          status.textContent =
            'Automatic copying is unavailable. The code is selected; use your keyboard shortcut to copy it.';
      }
      timer = setTimeout(() => {
        copyButton.innerHTML = `${icons.copy}<span>Copy</span>`;
        copyButton.classList.remove('is-done');
      }, 2000);
    });

    pre.tabIndex = 0;
    pre.setAttribute('role', 'region');
    pre.setAttribute('aria-label', `Code example ${index + 1}, scroll horizontally to read`);
    pre.before(shell);
    shell.append(bar, pre);
    bar.append(tab, tools);
    tools.append(wrapButton, copyButton);

    // Offer wrapping only when a line actually overflows.
    if (pre.scrollWidth <= pre.clientWidth && !('wrap' in pre.dataset)) wrapButton.hidden = true;

    // Long blocks start folded with a control that states the full length.
    if (lineCount > FOLD_AFTER) {
      shell.classList.add('is-folded');
      const fold = document.createElement('button');
      fold.type = 'button';
      fold.className = 'code-fold';
      fold.textContent = `Show all ${lineCount} lines`;
      fold.setAttribute('aria-expanded', 'false');
      fold.addEventListener('click', () => {
        const folded = shell.classList.toggle('is-folded');
        fold.textContent = folded ? `Show all ${lineCount} lines` : 'Show fewer lines';
        fold.setAttribute('aria-expanded', String(!folded));
        if (folded) shell.scrollIntoView({ block: 'nearest' });
      });
      shell.append(fold);
    }
  });
}
