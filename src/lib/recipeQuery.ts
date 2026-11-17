import type {
  CookingRecipe,
  RecipeMode,
  RefinerRecipe,
  RefinerSize,
} from "../types/recipe";

type FilterableRecipe = {
  inputs: { itemId: string; amount: number }[];
  output: { itemId: string; amount: number };
  refiner?: RefinerSize;
};

function matchesMode(
  recipe: FilterableRecipe,
  itemId: string | undefined,
  mode: RecipeMode,
): boolean {
  if (!itemId) return true;
  const makes = recipe.output.itemId === itemId;
  const uses = recipe.inputs.some((i) => i.itemId === itemId);
  if (mode === "makes") return makes;
  if (mode === "uses") return uses;
  return makes || uses;
}

function matchesText(
  recipe: FilterableRecipe,
  query: string,
  resolveName: (id: string) => string,
): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const haystack = [
    resolveName(recipe.output.itemId),
    recipe.output.itemId,
    ...recipe.inputs.flatMap((i) => [resolveName(i.itemId), i.itemId]),
  ]
    .join(" ")
    .toLowerCase();
  return haystack.includes(q);
}

export function filterRefinerRecipes(
  recipes: RefinerRecipe[],
  options: {
    query?: string;
    itemId?: string;
    mode?: RecipeMode;
    refiner?: RefinerSize | "any";
    resolveName: (id: string) => string;
  },
): RefinerRecipe[] {
  const mode = options.mode ?? "both";
  const refiner = options.refiner ?? "any";
  return recipes.filter((recipe) => {
    if (refiner !== "any" && recipe.refiner !== refiner) return false;
    if (!matchesMode(recipe, options.itemId, mode)) return false;
    if (!matchesText(recipe, options.query ?? "", options.resolveName)) {
      return false;
    }
    return true;
  });
}

export function filterCookingRecipes(
  recipes: CookingRecipe[],
  options: {
    query?: string;
    itemId?: string;
    mode?: RecipeMode;
    resolveName: (id: string) => string;
  },
): CookingRecipe[] {
  const mode = options.mode ?? "both";
  return recipes.filter((recipe) => {
    if (!matchesMode(recipe, options.itemId, mode)) return false;
    if (!matchesText(recipe, options.query ?? "", options.resolveName)) {
      return false;
    }
    return true;
  });
}

export function recipesForItem(
  refining: RefinerRecipe[],
  cooking: CookingRecipe[],
  itemId: string,
) {
  return {
    makesRefining: refining.filter((r) => r.output.itemId === itemId),
    usesRefining: refining.filter((r) =>
      r.inputs.some((i) => i.itemId === itemId),
    ),
    makesCooking: cooking.filter((r) => r.output.itemId === itemId),
    usesCooking: cooking.filter((r) =>
      r.inputs.some((i) => i.itemId === itemId),
    ),
  };
}
