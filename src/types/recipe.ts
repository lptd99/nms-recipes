export type ItemCategory =
  | "raw"
  | "products"
  | "food"
  | "technology"
  | "other";

export type RefinerSize = "portable" | "medium" | "large";

export type RecipeIO = {
  itemId: string;
  amount: number;
};

export type Item = {
  id: string;
  name: string;
  category: ItemCategory;
  subtitle?: string;
  description?: string;
  color?: string;
  value?: number;
  rarity?: string;
};

export type SearchIndexEntry = {
  id: string;
  name: string;
  category: ItemCategory;
  color?: string;
};

export type RefinerRecipe = {
  id: string;
  inputs: RecipeIO[];
  output: RecipeIO;
  refiner: RefinerSize;
  timeSec?: number;
  operation?: string;
};

export type CookingRecipe = {
  id: string;
  inputs: RecipeIO[];
  output: RecipeIO;
  timeSec?: number;
  operation?: string;
};

export type CraftingRecipe = {
  id: string;
  outputItemId: string;
  outputAmount: number;
  ingredients: RecipeIO[];
};

export type AppData = {
  items: Record<string, Item>;
  refining: RefinerRecipe[];
  cooking: CookingRecipe[];
  crafting: CraftingRecipe[];
  index: SearchIndexEntry[];
};

export type RecipeMode = "makes" | "uses" | "both";
