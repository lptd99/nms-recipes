import { useMemo, useState } from "react";
import { RecipeTable } from "../components/RecipeTable";
import { useAppData } from "../hooks/useAppData";
import { filterRefinerRecipes } from "../lib/recipeQuery";
import { resolveItemQuery } from "../lib/resolveItemQuery";
import type { RecipeMode, RefinerSize } from "../types/recipe";

export function RefiningPage() {
  const ctx = useAppData();
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<RecipeMode>("both");
  const [refiner, setRefiner] = useState<RefinerSize | "any">("any");

  const recipes = useMemo(() => {
    if (ctx.status !== "ready") return [];
    const itemId = resolveItemQuery(ctx.data.index, query);
    return filterRefinerRecipes(ctx.data.refining, {
      query: itemId ? "" : query,
      itemId,
      mode,
      refiner,
      resolveName: ctx.resolveName,
    });
  }, [ctx, query, mode, refiner]);

  if (ctx.status === "loading") {
    return <p className="status-banner">Loading…</p>;
  }
  if (ctx.status === "error") {
    return <p className="status-banner">{ctx.message}</p>;
  }

  return (
    <div className="stack">
      <section className="panel">
        <h1 className="section-title">Refining</h1>
        <p className="muted">
          {ctx.data.refining.length} refiner recipes. Filter by item name,
          whether a recipe makes or uses it, and refiner size.
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
          <label className="field">
            <span>Refiner</span>
            <select
              value={refiner}
              onChange={(e) =>
                setRefiner(e.target.value as RefinerSize | "any")
              }
            >
              <option value="any">Any</option>
              <option value="portable">Portable (1 input)</option>
              <option value="medium">Medium (2 inputs)</option>
              <option value="large">Large (3 inputs)</option>
            </select>
          </label>
        </div>
      </section>
      <section className="panel">
        <p className="muted" style={{ marginTop: 0 }}>
          Showing {recipes.length} recipes
        </p>
        <RecipeTable recipes={recipes} showRefiner />
      </section>
    </div>
  );
}
