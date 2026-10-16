/** Pure matching used by the fallback search and by result highlighting. */
export type IndexEntry = { title: string; description: string; tags: string[]; format?: string; url: string };
export type Range = { start: number; end: number };

const lower = (text: string) => text.toLocaleLowerCase('en-US');

export function queryTerms(query: string) {
  return lower(query).split(/\s+/).filter(Boolean);
}

/** Every term must appear somewhere in the title, summary, topics, or format label. */
export function matchIndex(query: string, entries: IndexEntry[]) {
  const terms = queryTerms(query);
  if (!terms.length) return [];
  return entries.filter((entry) => {
    const haystack = lower(`${entry.title} ${entry.description} ${entry.tags.join(' ')} ${entry.format || ''}`);
    return terms.every((term) => haystack.includes(term));
  });
}

/** Non-overlapping ranges to mark, scanning left to right and preferring the longest term at a position. */
export function highlightRanges(text: string, query: string): Range[] {
  const terms = queryTerms(query);
  const haystack = lower(text);
  const ranges: Range[] = [];
  let cursor = 0;
  while (cursor < text.length && terms.length) {
    const candidates = terms
      .map((term) => ({ at: haystack.indexOf(term, cursor), length: term.length }))
      .filter((match) => match.at >= 0)
      .sort((a, b) => a.at - b.at || b.length - a.length);
    const match = candidates[0];
    if (!match) break;
    ranges.push({ start: match.at, end: match.at + match.length });
    cursor = match.at + match.length;
  }
  return ranges;
}
