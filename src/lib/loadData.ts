import type {
  AppData,
  CraftingRecipe,
  CookingRecipe,
  Item,
  RefinerRecipe,
  SearchIndexEntry,
} from "../types/recipe";

async function fetchJson<T>(path: string): Promise<T> {
  const res = await fetch(path);
  if (!res.ok) {
    throw new Error(`Failed to load ${path}: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export async function loadAppData(): Promise<AppData> {
  const [items, refining, cooking, crafting, index] = await Promise.all([
    fetchJson<Record<string, Item>>("/data/items.json"),
    fetchJson<RefinerRecipe[]>("/data/refining.json"),
    fetchJson<CookingRecipe[]>("/data/cooking.json"),
    fetchJson<CraftingRecipe[]>("/data/crafting.json"),
    fetchJson<SearchIndexEntry[]>("/data/index.json"),
  ]);

  return { items, refining, cooking, crafting, index };
}
