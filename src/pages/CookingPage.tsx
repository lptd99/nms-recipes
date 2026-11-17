import { useMemo, useState } from "react";
import { RecipeTable } from "../components/RecipeTable";
import { useAppData } from "../hooks/useAppData";
import { filterCookingRecipes } from "../lib/recipeQuery";
import { resolveItemQuery } from "../lib/resolveItemQuery";
import type { RecipeMode } from "../types/recipe";

export function CookingPage() {
  const ctx = useAppData();
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<RecipeMode>("both");

  const recipes = useMemo(() => {
    if (ctx.status !== "ready") return [];
    const itemId = resolveItemQuery(ctx.data.index, query);
    return filterCookingRecipes(ctx.data.cooking, {
      query: itemId ? "" : query,
      itemId,
      mode,
      resolveName: ctx.resolveName,
    });
  }, [ctx, query, mode]);

  if (ctx.status === "loading") {
    return <p className="status-banner">Loading…</p>;
  }
  if (ctx.status === "error") {
    return <p className="status-banner">{ctx.message}</p>;
  }

  return (
    <div className="stack">
      <section className="panel">
        <h1 className="section-title">Cooking</h1>
        <p className="muted">
          {ctx.data.cooking.length} Nutrient Processor recipes.
        </p>
        <div className="row" style={{ marginTop: "1rem" }}>
          <label className="field" style={{ flex: "1 1 220px" }}>
            <span>Search</span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Item name"
            />
          </label>
          <label className="field">
            <span>Mode</span>
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value as RecipeMode)}
            >
              <option value="both">Both</option>
              <option value="makes">Makes it</option>
              <option value="uses">Uses it</option>
            </select>
          </label>
        </div>
      </section>
      <section className="panel">
        <p className="muted" style={{ marginTop: 0 }}>
          Showing {recipes.length} recipes
        </p>
        <RecipeTable recipes={recipes} />
      </section>
    </div>
  );
}
