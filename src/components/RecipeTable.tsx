import type { CookingRecipe, RefinerRecipe } from "../types/recipe";
import { ItemLink } from "./ItemLink";

type CommonRecipe = {
  id: string;
  inputs: { itemId: string; amount: number }[];
  output: { itemId: string; amount: number };
  timeSec?: number;
  operation?: string;
  refiner?: string;
};

type Props = {
  recipes: Array<RefinerRecipe | CookingRecipe | CommonRecipe>;
  showRefiner?: boolean;
  emptyLabel?: string;
};

function formatTime(sec?: number) {
  if (sec == null) return "—";
  if (sec < 1) return `~${sec.toFixed(2)}s`;
  if (sec < 60) return `~${sec.toFixed(1)}s`;
  return `~${(sec / 60).toFixed(1)}m`;
}

export function RecipeTable({
  recipes,
  showRefiner = false,
  emptyLabel = "No recipes match.",
}: Props) {
  if (!recipes.length) {
    return <p className="muted">{emptyLabel}</p>;
  }

  return (
    <div className="table-wrap" role="region" aria-label="Recipe table" tabIndex={0}>
      <table className="recipe-table">
        <thead>
          <tr>
            <th scope="col">Input 1</th>
            <th scope="col">Input 2</th>
            <th scope="col">Input 3</th>
            <th scope="col">Output</th>
            <th scope="col">Details</th>
          </tr>
        </thead>
        <tbody>
          {recipes.map((recipe) => {
            const [a, b, c] = recipe.inputs;
            return (
              <tr key={recipe.id}>
                <td>{a ? <ItemLink itemId={a.itemId} amount={a.amount} /> : "—"}</td>
                <td>{b ? <ItemLink itemId={b.itemId} amount={b.amount} /> : "—"}</td>
                <td>{c ? <ItemLink itemId={c.itemId} amount={c.amount} /> : "—"}</td>
                <td>
                  <ItemLink
                    itemId={recipe.output.itemId}
                    amount={recipe.output.amount}
                  />
                </td>
                <td>
                  <div className="stack" style={{ gap: "0.25rem" }}>
                    {recipe.operation ? <span>{recipe.operation}</span> : null}
                    <span className="muted">
                      {showRefiner && "refiner" in recipe && recipe.refiner
                        ? `${recipe.refiner} · ${formatTime(recipe.timeSec)}`
                        : formatTime(recipe.timeSec)}
                    </span>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
