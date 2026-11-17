import type { SearchIndexEntry } from "../types/recipe";

function normalize(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

export function searchItems(
  index: SearchIndexEntry[],
  query: string,
  limit = 20,
): SearchIndexEntry[] {
  const q = normalize(query);
  if (!q) return [];

  const tokens = q.split(/\s+/).filter(Boolean);
  const scored: { entry: SearchIndexEntry; score: number }[] = [];

  for (const entry of index) {
    const name = normalize(entry.name);
    const id = normalize(entry.id);
    let score = 0;

    if (name === q || id === q) score = 100;
    else if (name.startsWith(q)) score = 80;
    else if (name.includes(q)) score = 60;
    else if (id.includes(q)) score = 40;
    else if (tokens.every((t) => name.includes(t))) score = 50;
    else continue;

    scored.push({ entry, score });
  }

  return scored
    .sort(
      (a, b) =>
        b.score - a.score || a.entry.name.localeCompare(b.entry.name),
    )
    .slice(0, limit)
    .map((s) => s.entry);
}
