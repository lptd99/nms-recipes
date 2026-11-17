import type { RecipeIO, RefinerRecipe } from "../types/recipe";

export type BatchPlan = {
  recipe: RefinerRecipe;
  batches: number;
  outputAmount: number;
  ingredients: RecipeIO[];
  /** True when recipe consumes its own output (expansion loops). */
  selfFeeding: boolean;
  note?: string;
};

function isSelfFeeding(recipe: RefinerRecipe): boolean {
  return recipe.inputs.some((i) => i.itemId === recipe.output.itemId);
}

/**
 * Plan batches for a target quantity of the recipe output.
 * Self-feeding recipes (e.g. Chlorine + Oxygen → more Chlorine) use net-gain math.
 */
export function planBatches(
  recipe: RefinerRecipe,
  targetAmount: number,
): BatchPlan {
  const target = Math.max(1, Math.ceil(targetAmount));
  const outPerBatch = recipe.output.amount || 1;

  if (!isSelfFeeding(recipe)) {
    const batches = Math.ceil(target / outPerBatch);
    return {
      recipe,
      batches,
      outputAmount: batches * outPerBatch,
      ingredients: recipe.inputs.map((i) => ({
        itemId: i.itemId,
        amount: i.amount * batches,
      })),
      selfFeeding: false,
    };
  }

  const seed = recipe.inputs.find((i) => i.itemId === recipe.output.itemId);
  const seedPerBatch = seed?.amount ?? 0;
  const netGain = outPerBatch - seedPerBatch;

  if (netGain <= 0) {
    const batches = Math.ceil(target / outPerBatch);
    return {
      recipe,
      batches,
      outputAmount: batches * outPerBatch,
      ingredients: recipe.inputs.map((i) => ({
        itemId: i.itemId,
        amount: i.amount * batches,
      })),
      selfFeeding: true,
      note: "This recipe does not increase the output item on net; quantities assume full inputs each batch.",
    };
  }

  // Need enough net gain; seed is reused between batches after the first.
  const batches = Math.ceil(target / netGain);
  const extras = recipe.inputs
    .filter((i) => i.itemId !== recipe.output.itemId)
    .map((i) => ({
      itemId: i.itemId,
      amount: i.amount * batches,
    }));

  const ingredients: RecipeIO[] = [
    { itemId: recipe.output.itemId, amount: seedPerBatch },
    ...extras,
  ];

  return {
    recipe,
    batches,
    outputAmount: seedPerBatch + batches * netGain,
    ingredients,
    selfFeeding: true,
    note: `Self-feeding: start with ${seedPerBatch} ${recipe.output.itemId}, then run ${batches} batch(es) for +${netGain} net each.`,
  };
}
