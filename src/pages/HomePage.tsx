import { Link } from "react-router-dom";
import { ItemIcon } from "../components/ItemIcon";
import { useAppData } from "../hooks/useAppData";

const popularIds = ["STELLAR2", "ULTRAPROD2", "ULTRAPROD1", "ANTIMATTER", "FARMPROD3"];

export function HomePage() {
  const ctx = useAppData();

  if (ctx.status === "loading") {
    return <p className="status-banner">Loading recipe data…</p>;
  }
  if (ctx.status === "error") {
    return (
      <p className="status-banner">
        Could not load data. Run <code>npm run ingest</code> then refresh.
        <br />
        {ctx.message}
      </p>
    );
  }

  const { refining, cooking, crafting } = ctx.data;
  const popular = popularIds.filter((id) => ctx.getItem(id));

  return (
    <div className="stack">
      <section className="panel hero">
        <h1>Every recipe you can refine, cook, or craft</h1>
        <p>
          Search game-file recipes, filter by what goes in or comes out, and
          calculate ingredient totals for the amount you need.
        </p>
      </section>

      <section className="panel">
        <h2 className="section-title">Tools</h2>
        <div className="card-grid">
          <Link className="tool-card" to="/refining">
            <h3>Refining</h3>
            <p>{refining.length} refiner recipes. Search by input or output.</p>
          </Link>
          <Link className="tool-card" to="/cooking">
            <h3>Cooking</h3>
            <p>{cooking.length} Nutrient Processor recipes.</p>
          </Link>
          <Link className="tool-card" to="/crafting">
            <h3>Crafting</h3>
            <p>{crafting.length} crafts with trees down to raw materials.</p>
          </Link>
        </div>
      </section>

      <section className="panel">
        <h2 className="section-title">Catalogs</h2>
        <div className="card-grid">
          {[
            ["raw", "Raw materials"],
            ["products", "Products"],
            ["food", "Food"],
            ["technology", "Technology"],
          ].map(([slug, label]) => (
            <Link key={slug} className="catalog-card" to={`/catalog/${slug}`}>
              <h3>{label}</h3>
              <p>Browse items in this category.</p>
            </Link>
          ))}
        </div>
      </section>

      {popular.length ? (
        <section className="panel">
          <h2 className="section-title">Popular</h2>
          <div className="tile-grid tile-grid-compact">
            {popular.map((id) => {
              const item = ctx.getItem(id);
              if (!item) return null;
              return (
                <Link
                  key={id}
                  to={`/item/${encodeURIComponent(id)}`}
                  className="tile"
                >
                  <ItemIcon
                    itemId={id}
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
              );
            })}
          </div>
        </section>
      ) : null}

      <p className="muted" style={{ color: "rgba(248,250,252,0.75)" }}>
        Fan-made reference. No Man&apos;s Sky™ is a trademark of Hello Games.
        Not affiliated with or endorsed by Hello Games. Data derived from
        community game-file dumps.
      </p>
    </div>
  );
}
