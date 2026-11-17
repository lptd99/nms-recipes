import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const sourceDir = join(root, "data", "source");
const outDir = join(root, "public", "data");

function loadJson(name) {
  const path = join(sourceDir, name);
  if (!existsSync(path)) {
    throw new Error(`Missing source file: ${path}`);
  }
  return JSON.parse(readFileSync(path, "utf8"));
}

function toColor(entry) {
  const r = Number(entry.Colour_R ?? 0);
  const g = Number(entry.Colour_G ?? 0);
  const b = Number(entry.Colour_B ?? 0);
  if (!Number.isFinite(r) || !Number.isFinite(g) || !Number.isFinite(b)) {
    return undefined;
  }
  const hex = (n) =>
    Math.max(0, Math.min(255, Math.round(n * 255)))
      .toString(16)
      .padStart(2, "0");
  return `#${hex(r)}${hex(g)}${hex(b)}`;
}

function cleanText(text) {
  if (!text) return undefined;
  return String(text)
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function titleCaseName(text) {
  if (!text) return "Unknown";
  const cleaned = cleanText(text) ?? "Unknown";
  if (cleaned !== cleaned.toUpperCase()) return cleaned;
  return cleaned
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function refinerSize(inputCount) {
  if (inputCount >= 3) return "large";
  if (inputCount === 2) return "medium";
  return "portable";
}

/** Game TimeToMake units ≈ seconds * 250 on community sites. */
function toSeconds(timeToMake) {
  const n = Number(timeToMake);
  if (!Number.isFinite(n) || n <= 0) return undefined;
  return Math.round((n / 250) * 1000) / 1000;
}

function productCategory(id, entry) {
  const type = entry.Type ?? "";
  const wiki = entry.WikiCategory ?? "";
  const name = entry.Name_Text ?? "";
  if (
    type === "Consumable" ||
    String(id).startsWith("FOOD_") ||
    wiki === "Cooking" ||
    /food|ingredient|bait/i.test(entry.Subtitle_Text ?? "")
  ) {
    return "food";
  }
  if (type === "BuildingPart" || wiki === "Building") return "other";
  if (type === "Curiosity" || type === "Emote" || type === "CustomisationPart") {
    return "other";
  }
  if (type === "Fish" || type === "CreatureEgg" || type === "ExhibitBone") {
    return "other";
  }
  if (name.includes("FOOD") || wiki === "Food") return "food";
  return "products";
}

function mapIngredients(ingredients = []) {
  return ingredients
    .filter((ing) => ing?.Id)
    .map((ing) => ({
      itemId: String(ing.Id),
      amount: Number(ing.Amount) || 1,
    }));
}

const substances = loadJson("Substance_Table.json");
const products = loadJson("Product_Table.json");
const technologies = loadJson("Technology_Table.json");
const refiningTable = loadJson("Refining_Table.json");
const cookingTable = loadJson("Cooking_Table.json");
const craftingTable = loadJson("Crafting_Table.json");

/** @type {Record<string, object>} */
const items = {};

function upsertItem(id, partial) {
  const existing = items[id];
  if (!existing) {
    items[id] = { id, ...partial };
    return;
  }
  items[id] = {
    ...existing,
    ...partial,
    name: existing.name || partial.name,
    category: existing.category === "other" ? partial.category : existing.category,
    description: existing.description || partial.description,
    color: existing.color || partial.color,
    value: existing.value ?? partial.value,
    subtitle: existing.subtitle || partial.subtitle,
  };
}

for (const [id, entry] of Object.entries(substances)) {
  upsertItem(id, {
    name: titleCaseName(entry.NameLower_Text || entry.Name_Text),
    category: "raw",
    subtitle: cleanText(entry.Subtitle_Text),
    description: cleanText(entry.Description_Text),
    color: toColor(entry),
    value: Number(entry.BaseValue) || undefined,
    rarity: entry.Rarity || undefined,
  });
}

for (const [id, entry] of Object.entries(products)) {
  upsertItem(id, {
    name: titleCaseName(entry.NameLower_Text || entry.Name_Text),
    category: productCategory(id, entry),
    subtitle: cleanText(entry.Subtitle_Text),
    description: cleanText(entry.Description_Text),
    color: toColor(entry),
    value: Number(entry.BaseValue) || undefined,
  });
}

for (const [id, entry] of Object.entries(technologies)) {
  upsertItem(id, {
    name: titleCaseName(entry.NameLower_Text || entry.Name_Text),
    category: "technology",
    subtitle: cleanText(entry.Subtitle_Text),
    description: cleanText(entry.Description_Text),
    color: toColor(entry),
    value: Number(entry.BaseValue) || undefined,
  });
}

/** Ensure recipe endpoints exist as items even if tables omit them. */
function ensureNamedItem(id, name, color) {
  if (!id) return;
  if (items[id]) return;
  upsertItem(id, {
    name: titleCaseName(name || id),
    category: "other",
    color,
  });
}

const refining = [];
for (const [outputId, entry] of Object.entries(refiningTable)) {
  upsertItem(outputId, {
    name: titleCaseName(entry.NameLower_Text || entry.Name_Text),
    category: entry.Type === "product" ? productCategory(outputId, entry) : items[outputId]?.category || "raw",
    subtitle: cleanText(entry.Subtitle_Text),
    description: cleanText(entry.Description_Text),
    color: toColor(entry),
  });

  const recipes = entry.Recipes ?? [];
  recipes.forEach((recipe, idx) => {
    const inputs = mapIngredients(recipe.Ingredients);
    inputs.forEach((ing, i) => {
      const src = recipe.Ingredients[i];
      ensureNamedItem(ing.itemId, src?.NameLower_Text, toColor(src ?? {}));
    });
    if (!inputs.length) return;
    refining.push({
      id: `ref-${outputId}-${idx}`,
      inputs,
      output: {
        itemId: outputId,
        amount: Number(recipe.Amount) || 1,
      },
      refiner: refinerSize(inputs.length),
      timeSec: toSeconds(recipe.TimeToMake),
      operation: cleanText(recipe.RecipeName || recipe.RecipeType),
    });
  });
}

const cooking = [];
for (const [outputId, entry] of Object.entries(cookingTable)) {
  upsertItem(outputId, {
    name: titleCaseName(entry.NameLower_Text || entry.Name_Text),
    category: "food",
    subtitle: cleanText(entry.Subtitle_Text),
    description: cleanText(entry.Description_Text),
    color: toColor(entry),
  });

  const recipes = entry.Recipes ?? [];
  recipes.forEach((recipe, idx) => {
    const inputs = mapIngredients(recipe.Ingredients);
    inputs.forEach((ing, i) => {
      const src = recipe.Ingredients[i];
      ensureNamedItem(ing.itemId, src?.NameLower_Text, toColor(src ?? {}));
    });
    if (!inputs.length) return;
    cooking.push({
      id: `cook-${outputId}-${idx}`,
      inputs,
      output: {
        itemId: outputId,
        amount: Number(recipe.Amount) || 1,
      },
      timeSec: toSeconds(recipe.TimeToMake),
      operation: cleanText(recipe.RecipeName || recipe.RecipeType),
    });
  });
}

const crafting = [];
for (const [outputId, entry] of Object.entries(craftingTable)) {
  const ingredients = mapIngredients(entry.Ingredients);
  ingredients.forEach((ing, i) => {
    const src = entry.Ingredients[i];
    ensureNamedItem(ing.itemId, src?.NameLower_Text, toColor(src ?? {}));
  });
  upsertItem(outputId, {
    name: titleCaseName(entry.NameLower_Text || entry.Name_Text),
    category: productCategory(outputId, entry),
    subtitle: cleanText(entry.Subtitle_Text),
    description: cleanText(entry.Description_Text),
    color: toColor(entry),
    value: Number(entry.BaseValue) || undefined,
  });
  if (!ingredients.length) continue;
  crafting.push({
    id: `craft-${outputId}`,
    outputItemId: outputId,
    outputAmount: 1,
    ingredients,
  });
}

const index = Object.values(items)
  .map((item) => ({
    id: item.id,
    name: item.name,
    category: item.category,
    color: item.color,
  }))
  .sort((a, b) => a.name.localeCompare(b.name));

mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "items.json"), JSON.stringify(items));
writeFileSync(join(outDir, "refining.json"), JSON.stringify(refining));
writeFileSync(join(outDir, "cooking.json"), JSON.stringify(cooking));
writeFileSync(join(outDir, "crafting.json"), JSON.stringify(crafting));
writeFileSync(join(outDir, "index.json"), JSON.stringify(index));

console.log(
  JSON.stringify(
    {
      items: Object.keys(items).length,
      refining: refining.length,
      cooking: cooking.length,
      crafting: crafting.length,
      index: index.length,
    },
    null,
    2,
  ),
);
