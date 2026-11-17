/** In-game icons as served by nomansskyrecipes.com (same ID → file map). */
const REMOTE_BASE = "https://nomansskyrecipes.com/images/items";

export function itemIconUrl(itemId: string): string {
  return `${REMOTE_BASE}/${encodeURIComponent(itemId)}.webp`;
}
