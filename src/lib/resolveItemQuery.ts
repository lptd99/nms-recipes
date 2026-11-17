import type { SearchIndexEntry } from "../types/recipe";
import { searchItems } from "./search";

/** Resolve a free-text query to a single item id when possible. */
export function resolveItemQuery(
  index: SearchIndexEntry[],
  query: string,
): string | undefined {
  const q = query.trim();
  if (!q) return undefined;
  const hits = searchItems(index, q, 5);
  if (!hits.length) return undefined;
  const exact = hits.find(
    (h) => h.name.toLowerCase() === q.toLowerCase() || h.id.toLowerCase() === q.toLowerCase(),
  );
  return (exact ?? hits[0]).id;
}
