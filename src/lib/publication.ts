type DatedEntry = { id: string; data: { date: Date; draft: boolean } };

/** Shared by pages, RSS, and the search-indexed build, so drafts stay private. */
export function publishedEntries<T extends DatedEntry>(entries: T[], now = new Date()): T[] {
  return entries
    .filter(({ data }) => !data.draft && data.date <= now)
    .sort((a, b) => b.data.date.getTime() - a.data.date.getTime() || a.id.localeCompare(b.id));
}
