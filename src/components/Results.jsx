import React from "react";
import { CATEGORIES, ROLE_CATEGORIES, CERT_LABELS } from "../data/catalog.js";
import { relatedSearches } from "../lib/ai.js";
import { inItaly } from "../lib/mapGeo.js";
import { LiveMap } from "./LiveMap.jsx";

export function Results({ input, setInput, onSubmit, onSearch, results, intent, activeCategory, setActiveCategory, hoveredId, setHoveredId, onOpen }) {
  const abroad = results.filter((c) => !inItaly(c));
  const related = relatedSearches(intent);
  return (
    <main className="res">
      <form className="searchbar compact" onSubmit={(e) => { e.preventDefault(); onSubmit(); }}>
        <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Linen yarn, seamless, GRS recycled…" aria-label="Search" />
        <button type="submit">Search →</button>
      </form>

      <div className="chips" role="tablist" aria-label="Categorie">
        <button className={"chip" + (!activeCategory ? " on" : "")} onClick={() => setActiveCategory(null)}>Tutte</button>
        {CATEGORIES.map((c) => (
          <button key={c} className={"chip" + (activeCategory === c ? " on" : "")} onClick={() => setActiveCategory(activeCategory === c ? null : c)}>{c}</button>
        ))}
      </div>
      <div className="chips roles" role="tablist" aria-label="Tipologia di operatore">
        {ROLE_CATEGORIES.map((c) => (
          <button key={c} className={"chip soft" + (activeCategory === c ? " on" : "")} onClick={() => setActiveCategory(activeCategory === c ? null : c)}>{c}</button>
        ))}
      </div>

      {intent && (intent.category || intent.materials.length > 0) && (
        <p className="ai-note">
          <span className="ai-dot" aria-hidden="true" />
          Ricerca interpretata{intent.materials.length > 0 && <> — materiali: <strong>{intent.materials.join(", ")}</strong></>}{intent.category && !activeCategory && <> — categoria: <strong>{intent.category}</strong></>}
        </p>
      )}
      {related.length > 0 && (
        <p className="ai-note">
          <span className="ai-dot" aria-hidden="true" />
          TEXA AI suggerisce anche:&nbsp;
          {related.map((r) => (
            <button key={r} className="hint-link sm" onClick={() => onSearch(r)}>{r}</button>
          ))}
        </p>
      )}

      <div className="res-grid">
        <div className="res-list">
          <p className="res-count">{results.length} risultat{results.length === 1 ? "o" : "i"}</p>
          {results.length === 0 && (
            <div className="empty">
              <p>Nessuna azienda trovata.</p>
              <p className="empty-sub">Prova con un materiale ("lino", "cotone") o una lavorazione ("ricamo", "stampa").</p>
            </div>
          )}
          {results.map((c) => (
            <article key={c.id}
              className={"card" + (hoveredId === c.id ? " hl" : "")}
              onMouseEnter={() => setHoveredId(c.id)} onMouseLeave={() => setHoveredId(null)}
              onClick={() => onOpen(c.id)} tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && onOpen(c.id)}>
              <div className="card-top">
                <h3>{c.name}</h3>
                <span className="card-arrow" aria-hidden="true">↗</span>
              </div>
              <p className="card-desc">{c.description}</p>
              <div className="card-meta">
                <span className="pill">{c.category}</span>
                <span className="loc">{c.city}{c.province === "PL" ? " · PL" : c.province ? " (" + c.province + ")" : ""}</span>
                {c.certifications.map((cert) => <span key={cert} className="cert" title={CERT_LABELS[cert] || cert}>{cert}</span>)}
              </div>
            </article>
          ))}
        </div>

        <aside className="res-map">
          <LiveMap companies={results.filter(inItaly)} hoveredId={hoveredId} setHoveredId={setHoveredId} onOpen={onOpen} />
          {abroad.length > 0 && <p className="abroad">+{abroad.length} partner estero ({abroad.map((c) => c.city).join(", ")})</p>}
        </aside>
      </div>
    </main>
  );
}
