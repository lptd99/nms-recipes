import { useMemo, useState } from "react";
import { CraftTree } from "../components/CraftTree";
import { ItemLink } from "../components/ItemLink";
import { useAppData } from "../hooks/useAppData";
import { expandCraftTree, rawTotals } from "../lib/craftTree";

export function CraftingPage() {
  const ctx = useAppData();
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const list = useMemo(() => {
    if (ctx.status !== "ready") return [];
    const q = query.trim().toLowerCase();
    return ctx.data.crafting
      .map((c) => ({
        ...c,
        name: ctx.resolveName(c.outputItemId),
      }))
      .filter((c) => !q || c.name.toLowerCase().includes(q) || c.outputItemId.toLowerCase().includes(q))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [ctx, query]);

  const activeId = selectedId ?? list[0]?.outputItemId ?? null;

  const tree = useMemo(() => {
    if (ctx.status !== "ready" || !activeId) return null;
    return expandCraftTree(ctx.data.crafting, activeId, 1);
  }, [ctx, activeId]);

  const totals = useMemo(() => (tree ? rawTotals(tree) : []), [tree]);

  if (ctx.status === "loading") {
    return <p className="status-banner">Loading…</p>;
  }
  if (ctx.status === "error") {
    return <p className="status-banner">{ctx.message}</p>;
  }

  return (
    <div className="stack">
      <section className="panel">
        <h1 className="section-title">Crafting</h1>
        <p className="muted">
          {ctx.data.crafting.length} craftable items. Pick one to expand the
          full tree down to raw materials.
        </p>
        <label className="field" style={{ marginTop: "1rem", maxWidth: "28rem" }}>
          <span>Search crafts</span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Metal plating, antimatter…"
          />
        </label>
      </section>

      <div
        className="craft-layout"
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(220px, 320px) 1fr",
          gap: "1rem",
        }}
      >
        <section className="panel" style={{ maxHeight: "70vh", overflow: "auto" }}>
          <h2 className="section-title">Items</h2>
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {list.slice(0, 200).map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  className="btn btn-ghost"
                  style={{
                    width: "100%",
                    justifyContent: "flex-start",
                    textAlign: "left",
                    marginBottom: "0.35rem",
                    background:
                      c.outputItemId === activeId
                        ? "rgba(14, 143, 139, 0.12)"
                        : undefined,
                  }}
                  onClick={() => setSelectedId(c.outputItemId)}
                >
                  {c.name}
                </button>
              </li>
            ))}
          </ul>
          {list.length > 200 ? (
            <p className="muted">Showing first 200 matches. Refine your search.</p>
          ) : null}
        </section>

        <section className="panel">
          {activeId && tree ? (
            <>
              <h2 className="section-title">
                <ItemLink itemId={activeId} />
              </h2>
              <h3>Craft tree</h3>
              <CraftTree node={tree} />
              <h3 style={{ marginTop: "1.25rem" }}>Raw totals</h3>
              <ul className="stack" style={{ listStyle: "none", padding: 0 }}>
                {totals.map((t) => (
                  <li key={t.itemId}>
                    <ItemLink itemId={t.itemId} amount={t.amount} />
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="muted">No craftable items match.</p>
          )}
        </section>
      </div>
    </div>
  );
}
