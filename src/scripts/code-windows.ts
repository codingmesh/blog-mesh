/** Wraps each code block in window chrome with a title and a copy button. Titles come from the fence meta. */
const languageLabels: Record<string, string> = {
  typescript: 'TypeScript',
  ts: 'TypeScript',
  javascript: 'JavaScript',
  js: 'JavaScript',
  tsx: 'TSX',
  jsx: 'JSX',
  bash: 'Terminal',
  shell: 'Terminal',
  sh: 'Terminal',
  zsh: 'Terminal',
  python: 'Python',
  json: 'JSON',
  css: 'CSS',
  html: 'HTML',
  astro: 'Astro',
  yaml: 'YAML',
  yml: 'YAML',
};

export function windowTitle(pre: HTMLElement, code: HTMLElement) {
  const language = pre.dataset.language || code.dataset.language || '';
  return pre.dataset.title || languageLabels[language] || language || 'Code';
}

export function initCodeWindows(
  root: ParentNode = document,
  status = document.querySelector<HTMLElement>('#copy-status'),
) {
  root.querySelectorAll<HTMLPreElement>('.prose pre').forEach((pre, index) => {
    const code = pre.querySelector('code');
    if (!code || pre.parentElement?.classList.contains('code-block')) return;
    const shell = document.createElement('div');
    shell.className = 'code-block';
    const toolbar = document.createElement('div');
    toolbar.className = 'code-toolbar';
    toolbar.setAttribute('data-pagefind-ignore', '');
    const controls = document.createElement('span');
    controls.className = 'window-controls';
    controls.setAttribute('aria-hidden', 'true');
    for (const color of ['red', 'yellow', 'green']) {
      const dot = document.createElement('span');
      dot.className = `window-dot ${color}`;
      controls.append(dot);
    }
    const label = document.createElement('span');
    label.className = 'window-title';
    label.textContent = windowTitle(pre, code);
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'copy-code';
    button.textContent = 'Copy code';
    button.setAttribute('aria-label', `Copy code block ${index + 1}`);
    pre.tabIndex = 0;
    pre.setAttribute('role', 'region');
    pre.setAttribute('aria-label', `Code example ${index + 1}, scroll horizontally to read`);
    pre.before(shell);
    shell.append(toolbar, pre);
    toolbar.append(controls, label, button);
    let timer: ReturnType<typeof setTimeout>;
    button.addEventListener('click', async () => {
      clearTimeout(timer);
      try {
        await navigator.clipboard.writeText(code.textContent || '');
        button.textContent = 'Copied';
        if (status) status.textContent = `Code block ${index + 1} copied.`;
      } catch {
        const range = document.createRange();
        range.selectNodeContents(code);
        const selection = window.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(range);
        pre.focus();
        button.textContent = 'Selected';
        if (status)
          status.textContent =
            'Automatic copying is unavailable. The code is selected; use your keyboard shortcut to copy it.';
      }
      timer = setTimeout(() => {
        button.textContent = 'Copy code';
      }, 2200);
    });
  });
}
