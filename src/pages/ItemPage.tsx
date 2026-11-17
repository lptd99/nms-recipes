import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { CraftTree } from "../components/CraftTree";
import { ItemIcon } from "../components/ItemIcon";
import { ItemLink } from "../components/ItemLink";
import { QuantityCalculator } from "../components/QuantityCalculator";
import { RecipeTable } from "../components/RecipeTable";
import { useAppData } from "../hooks/useAppData";
import { pickBestYield, pickQuickest } from "../lib/bestRecipe";
import {
  expandCraftTree,
  getCraftingRecipe,
  rawTotals,
} from "../lib/craftTree";
import { recipesForItem } from "../lib/recipeQuery";

export function ItemPage() {
  const { id = "" } = useParams();
  const itemId = decodeURIComponent(id);
  const ctx = useAppData();
  const [recipeChoice, setRecipeChoice] = useState<"best" | "quick">("best");

  const related = useMemo(() => {
    if (ctx.status !== "ready") return null;
    return recipesForItem(ctx.data.refining, ctx.data.cooking, itemId);
  }, [ctx, itemId]);

  const best = useMemo(
    () => (related ? pickBestYield(related.makesRefining) : undefined),
    [related],
  );
  const quick = useMemo(
    () => (related ? pickQuickest(related.makesRefining) : undefined),
    [related],
  );

  const craftRecipe = useMemo(() => {
    if (ctx.status !== "ready") return undefined;
    return getCraftingRecipe(ctx.data.crafting, itemId);
  }, [ctx, itemId]);

  const craftTree = useMemo(() => {
    if (ctx.status !== "ready" || !craftRecipe) return null;
    return expandCraftTree(ctx.data.crafting, itemId, 1);
  }, [ctx, craftRecipe, itemId]);

  if (ctx.status === "loading") {
    return <p className="status-banner">Loading…</p>;
  }
  if (ctx.status === "error") {
    return <p className="status-banner">{ctx.message}</p>;
  }

  const item = ctx.getItem(itemId);
  if (!item) {
    return (
      <section className="panel">
        <h1 className="section-title">Item not found</h1>
        <p className="muted">No item with id {itemId}.</p>
        <Link to="/">Back home</Link>
      </section>
    );
  }

  const calcRecipe =
    recipeChoice === "quick" && quick ? quick : best ?? quick;

  return (
    <div className="stack">
      <section className="panel">
        <div className="item-head">
          <ItemIcon
            itemId={item.id}
            color={item.color}
            name={item.name}
            size="xl"
            priority
          />
          <div className="item-title">
            <h1 className="section-title" style={{ margin: 0 }}>
              {item.name}
            </h1>
            <ul className="item-pills" role="list">
              {item.subtitle ? (
                <li>
                  <span className="pill">{item.subtitle}</span>
                </li>
              ) : null}
              <li>
                <span className="badge">{item.category}</span>
              </li>
              {item.value != null ? (
                <li>
                  <span className="pill">{item.value} units</span>
                </li>
              ) : null}
              {item.rarity ? (
                <li>
                  <span className="pill">{item.rarity}</span>
                </li>
              ) : null}
              <li>
                <span className="pill">
                  {related?.makesRefining.length ?? 0} refine recipes
                </span>
              </li>
            </ul>
            {item.description ? (
              <p className="item-summary">{item.description}</p>
            ) : null}
          </div>
        </div>
      </section>

      {best || quick ? (
        <section className="panel">
          <h2 className="section-title">Best refine</h2>
          {best ? (
            <div className="recipe-eq">
              <span className="muted">Best yield</span>
              <div className="row">
                {best.inputs.map((i, idx) => (
                  <span key={`${i.itemId}-${idx}`} className="row" style={{ gap: "0.35rem" }}>
                    {idx ? <span className="muted">+</span> : null}
                    <ItemLink
                      itemId={i.itemId}
                      amount={i.amount}
                      iconSize="md"
                      showAmountInIcon
                    />
                  </span>
                ))}
                <span className="muted" aria-hidden="true">
                  →
                </span>
                <ItemLink
                  itemId={best.output.itemId}
                  amount={best.output.amount}
                  iconSize="md"
                  showAmountInIcon
                />
                <span className="badge">{best.refiner}</span>
                {best.timeSec != null ? (
                  <span className="muted">~{best.timeSec}s</span>
                ) : null}
              </div>
            </div>
          ) : null}
          {quick && quick.id !== best?.id ? (
            <div className="recipe-eq">
              <span className="muted">Quickest</span>
              <div className="row">
                {quick.inputs.map((i, idx) => (
                  <span key={`${i.itemId}-${idx}`} className="row" style={{ gap: "0.35rem" }}>
                    {idx ? <span className="muted">+</span> : null}
                    <ItemLink
                      itemId={i.itemId}
                      amount={i.amount}
                      iconSize="md"
                      showAmountInIcon
                    />
                  </span>
                ))}
                <span className="muted" aria-hidden="true">
                  →
                </span>
                <ItemLink
                  itemId={quick.output.itemId}
                  amount={quick.output.amount}
                  iconSize="md"
                  showAmountInIcon
                />
                <span className="badge">{quick.refiner}</span>
                {quick.timeSec != null ? (
                  <span className="muted">~{quick.timeSec}s</span>
                ) : null}
              </div>
            </div>
          ) : null}

          {calcRecipe ? (
            <>
              <div className="row" style={{ margin: "0.75rem 0" }}>
                <button
                  type="button"
                  className="btn btn-ghost"
                  aria-pressed={recipeChoice === "best"}
                  onClick={() => setRecipeChoice("best")}
                  disabled={!best}
                >
                  Calculate best yield
                </button>
                <button
                  type="button"
                  className="btn btn-ghost"
                  aria-pressed={recipeChoice === "quick"}
                  onClick={() => setRecipeChoice("quick")}
                  disabled={!quick}
                >
                  Calculate quickest
                </button>
              </div>
              <QuantityCalculator recipe={calcRecipe} />
            </>
          ) : null}
        </section>
      ) : null}

      {craftTree ? (
        <section className="panel">
          <h2 className="section-title">How to craft</h2>
          <CraftTree node={craftTree} />
          <h3>Raw totals</h3>
          <ul className="stack" style={{ listStyle: "none", padding: 0 }}>
            {rawTotals(craftTree).map((t) => (
              <li key={t.itemId}>
                <ItemLink itemId={t.itemId} amount={t.amount} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {related && related.makesRefining.length ? (
        <section className="panel">
          <h2 className="section-title">
            How to refine ({related.makesRefining.length})
          </h2>
          <RecipeTable recipes={related.makesRefining} showRefiner />
        </section>
      ) : null}

      {related && related.usesRefining.length ? (
        <section className="panel">
          <h2 className="section-title">Used in refining</h2>
          <RecipeTable recipes={related.usesRefining} showRefiner />
        </section>
      ) : null}

      {related && related.makesCooking.length ? (
        <section className="panel">
          <h2 className="section-title">How to cook</h2>
          <RecipeTable recipes={related.makesCooking} />
        </section>
      ) : null}

      {related && related.usesCooking.length ? (
        <section className="panel">
          <h2 className="section-title">Used in cooking</h2>
          <RecipeTable recipes={related.usesCooking} />
        </section>
      ) : null}
    </div>
  );
}
