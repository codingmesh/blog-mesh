import { useState } from 'react';

/**
 * Interactive version of the check-outcomes diagram from "Reliable automation starts with visible failures".
 * Server-rendered as the full static diagram; once hydrated, choosing an outcome shows what `describe()` returns.
 */
type Article = { title: string };
type CheckResult =
  | { status: 'updated'; articles: Article[] }
  | { status: 'unchanged'; checkedAt: Date }
  | { status: 'failed'; reason: string };

// Mirrors the type sketch in the article.
function describe(result: CheckResult): string {
  switch (result.status) {
    case 'updated':
      return `Articles found: ${result.articles.length}`;
    case 'unchanged':
      return 'Check complete. No updates.';
    case 'failed':
      return `Check failed: ${result.reason}`;
  }
}

const outcomes: { result: CheckResult; label: string; action: string; incomplete?: boolean }[] = [
  {
    result: { status: 'updated', articles: [{ title: 'a' }, { title: 'b' }] },
    label: 'Updates found',
    action: 'Process new items',
  },
  { result: { status: 'unchanged', checkedAt: new Date(0) }, label: 'No updates', action: 'Save check time' },
  {
    result: { status: 'failed', reason: 'source unavailable' },
    label: 'Check incomplete',
    action: 'Keep cursor and retry',
    incomplete: true,
  },
];

export default function OutcomeExplorer() {
  const [selected, setSelected] = useState<CheckResult['status'] | null>(null);
  const current = outcomes.find((outcome) => outcome.result.status === selected);
  return (
    <figure className="outcome-explorer" aria-labelledby="outcome-caption">
      <div className="outcome-origin">Check source</div>
      <ul className="outcome-list" role="list" data-selected={selected ? '' : undefined}>
        {outcomes.map((outcome) => (
          <li
            key={outcome.result.status}
            className={outcome.incomplete ? 'outcome-incomplete' : undefined}
            data-active={selected === outcome.result.status ? '' : undefined}
          >
            <button
              type="button"
              aria-pressed={selected === outcome.result.status}
              onClick={() => setSelected(selected === outcome.result.status ? null : outcome.result.status)}
            >
              <strong>{outcome.label}</strong>
              <span>{outcome.action}</span>
            </button>
          </li>
        ))}
      </ul>
      <output className="outcome-result" aria-live="polite">
        {current ? (
          <>
            <code>describe(result)</code> returns <q>{describe(current.result)}</q>
          </>
        ) : (
          'Select an outcome to see what describe() returns.'
        )}
      </output>
      <figcaption id="outcome-caption">An empty result and a failed check are different outcomes.</figcaption>
    </figure>
  );
}
