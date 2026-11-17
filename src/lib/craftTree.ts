import type { CraftingRecipe, RecipeIO } from "../types/recipe";

export type CraftNode = {
  itemId: string;
  amount: number;
  children: CraftNode[];
};

export function getCraftingRecipe(
  crafting: CraftingRecipe[],
  itemId: string,
): CraftingRecipe | undefined {
  return crafting.find((c) => c.outputItemId === itemId);
}

export function expandCraftTree(
  crafting: CraftingRecipe[],
  itemId: string,
  amount = 1,
  seen = new Set<string>(),
): CraftNode {
  if (seen.has(itemId)) {
    return { itemId, amount, children: [] };
  }

  const recipe = getCraftingRecipe(crafting, itemId);
  if (!recipe) {
    return { itemId, amount, children: [] };
  }

  const nextSeen = new Set(seen);
  nextSeen.add(itemId);
  const batches = Math.ceil(amount / (recipe.outputAmount || 1));

  return {
    itemId,
    amount,
    children: recipe.ingredients.map((ing) =>
      expandCraftTree(
        crafting,
        ing.itemId,
        ing.amount * batches,
        nextSeen,
      ),
    ),
  };
}

/** Flatten craft tree to raw totals (leaves only). */
export function rawTotals(node: CraftNode): RecipeIO[] {
  const totals = new Map<string, number>();

  function walk(n: CraftNode) {
    if (!n.children.length) {
      totals.set(n.itemId, (totals.get(n.itemId) ?? 0) + n.amount);
      return;
    }
    for (const child of n.children) walk(child);
  }

  walk(node);
  return [...totals.entries()]
    .map(([itemId, amount]) => ({ itemId, amount }))
    .sort((a, b) => a.itemId.localeCompare(b.itemId));
}
