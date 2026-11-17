import { useEffect, useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { SearchDialog } from "./SearchDialog";

const nav = [
  { to: "/refining", label: "Refining" },
  { to: "/cooking", label: "Cooking" },
  { to: "/crafting", label: "Crafting" },
  { to: "/catalog/raw", label: "Catalogs" },
];

export function Layout() {
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName;
      if (
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        tag === "SELECT" ||
        target?.isContentEditable
      ) {
        return;
      }
      if (e.key === "/") {
        e.preventDefault();
        setSearchOpen(true);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main">
        Skip to main content
      </a>
      <header className="site-header">
        <Link to="/" className="brand">
          <strong>Orbit Pantry</strong>
          <span>No Man&apos;s Sky recipes</span>
        </Link>
        <nav className="nav-links" aria-label="Site">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
            >
              {item.label}
            </NavLink>
          ))}
          <button type="button" onClick={() => setSearchOpen(true)}>
            Search /
          </button>
        </nav>
      </header>
      <main id="main">
        <Outlet />
      </main>
      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}
