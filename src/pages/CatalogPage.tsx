import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { ItemIcon } from "../components/ItemIcon";
import { useAppData } from "../hooks/useAppData";
import type { ItemCategory } from "../types/recipe";

const labels: Record<ItemCategory, string> = {
  raw: "Raw materials",
  products: "Products",
  food: "Food",
  technology: "Technology",
  other: "Other",
};

const categories: ItemCategory[] = [
  "raw",
  "products",
  "food",
  "technology",
  "other",
];

export function CatalogPage() {
  const { category = "raw" } = useParams();
  const ctx = useAppData();
  const cat = (categories.includes(category as ItemCategory)
    ? category
    : "raw") as ItemCategory;

  const items = useMemo(() => {
    if (ctx.status !== "ready") return [];
    return Object.values(ctx.data.items)
      .filter((i) => i.category === cat)
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [ctx, cat]);

  if (ctx.status === "loading") {
    return <p className="status-banner">Loading…</p>;
  }
  if (ctx.status === "error") {
    return <p className="status-banner">{ctx.message}</p>;
  }

  return (
    <div className="stack">
      <section className="panel">
        <h1 className="section-title">{labels[cat]}</h1>
        <div className="row">
          {categories.map((c) => (
            <Link
              key={c}
              to={`/catalog/${c}`}
              className="btn btn-ghost"
              aria-current={c === cat ? "page" : undefined}
            >
              {labels[c]}
            </Link>
          ))}
        </div>
      </section>
      <section className="panel">
        <p className="muted" style={{ marginTop: 0 }}>
          {items.length} items
        </p>
        <div className="tile-grid">
          {items.map((item) => (
            <Link
              key={item.id}
              to={`/item/${encodeURIComponent(item.id)}`}
              className="tile"
            >
              <ItemIcon
                itemId={item.id}
                color={item.color}
                name={item.name}
                size="md"
              />
              <span className="tile-text">
                <span className="tile-name">{item.name}</span>
                {item.subtitle ? (
                  <span className="tile-meta">{item.subtitle}</span>
                ) : null}
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
