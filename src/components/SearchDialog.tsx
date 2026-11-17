import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useAppData } from "../hooks/useAppData";
import { searchItems } from "../lib/search";
import { ItemIcon } from "./ItemIcon";

type Props = {
  open: boolean;
  onClose: () => void;
};

export function SearchDialog({ open, onClose }: Props) {
  const ctx = useAppData();
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    setQuery("");
    const t = window.setTimeout(() => inputRef.current?.focus(), 0);
    return () => window.clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const results = useMemo(() => {
    if (ctx.status !== "ready") return [];
    return searchItems(ctx.data.index, query, 25);
  }, [ctx, query]);

  if (!open) return null;

  return (
    <div
      className="dialog-backdrop"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <div className="row" style={{ justifyContent: "space-between" }}>
          <h2 id={titleId} className="section-title" style={{ margin: 0 }}>
            Search items
          </h2>
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Close
          </button>
        </div>
        <label className="field" style={{ marginTop: "0.75rem" }}>
          <span className="muted">Type a name (press / anywhere to open)</span>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Try chromatic metal"
            aria-label="Search items and recipes"
          />
        </label>
        <ul className="search-results">
          {results.map((entry) => (
            <li key={entry.id}>
              <Link
                to={`/item/${encodeURIComponent(entry.id)}`}
                onClick={onClose}
              >
                <ItemIcon
                  itemId={entry.id}
                  color={entry.color}
                  name={entry.name}
                  size="sm"
                />
                <span>
                  <strong>{entry.name}</strong>
                  <span className="muted"> · {entry.category}</span>
                </span>
              </Link>
            </li>
          ))}
          {query && !results.length ? (
            <li className="muted" style={{ padding: "0.6rem" }}>
              No matches.
            </li>
          ) : null}
        </ul>
      </div>
    </div>
  );
}
