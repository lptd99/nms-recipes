import type { RefinerRecipe } from "../types/recipe";

/** Higher is better: output amount divided by total input amount. */
export function yieldScore(recipe: RefinerRecipe): number {
  const inputTotal = recipe.inputs.reduce((sum, i) => sum + i.amount, 0) || 1;
  return recipe.output.amount / inputTotal;
}

export function pickBestYield(
  recipes: RefinerRecipe[],
): RefinerRecipe | undefined {
  if (!recipes.length) return undefined;
  return [...recipes].sort((a, b) => {
    const y = yieldScore(b) - yieldScore(a);
    if (y !== 0) return y;
    const ta = a.timeSec ?? Number.POSITIVE_INFINITY;
    const tb = b.timeSec ?? Number.POSITIVE_INFINITY;
    return ta - tb;
  })[0];
}

export function pickQuickest(
  recipes: RefinerRecipe[],
): RefinerRecipe | undefined {
  if (!recipes.length) return undefined;
  return [...recipes].sort((a, b) => {
    const ta = a.timeSec ?? Number.POSITIVE_INFINITY;
    const tb = b.timeSec ?? Number.POSITIVE_INFINITY;
    if (ta !== tb) return ta - tb;
    return yieldScore(b) - yieldScore(a);
  })[0];
}
