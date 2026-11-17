import { useMemo, useState } from "react";
import { planBatches } from "../lib/calculator";
import type { RefinerRecipe } from "../types/recipe";
import { ItemLink } from "./ItemLink";

type Props = {
  recipe: RefinerRecipe;
};

export function QuantityCalculator({ recipe }: Props) {
  const [needed, setNeeded] = useState(1);
  const plan = useMemo(
    () => planBatches(recipe, Number.isFinite(needed) ? needed : 1),
    [recipe, needed],
  );

  return (
    <div className="stack">
      <div className="field" style={{ maxWidth: "12rem" }}>
        <label htmlFor="qty-needed">I need</label>
        <input
          id="qty-needed"
          type="number"
          min={1}
          value={needed}
          onChange={(e) => setNeeded(Math.max(1, Number(e.target.value) || 1))}
        />
      </div>
      <p>
        <strong>{plan.batches}</strong> batch
        {plan.batches === 1 ? "" : "es"} →{" "}
        <ItemLink itemId={recipe.output.itemId} amount={plan.outputAmount} />
      </p>
      <ul className="stack" style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {plan.ingredients.map((ing) => (
          <li key={ing.itemId}>
            <ItemLink itemId={ing.itemId} amount={ing.amount} />
          </li>
        ))}
      </ul>
      {plan.note ? <p className="muted">{plan.note}</p> : null}
    </div>
  );
}
