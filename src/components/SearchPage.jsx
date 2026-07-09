import React, { useState } from "react";
import { CATEGORIES } from "../data/catalog.js";
import { useTrends } from "../data/trends.js";
import { useCompanies } from "../state/companies.jsx";
import { TrendColors } from "./TrendColors.jsx";
import { FruitBackground } from "./FruitBackground.jsx";

// Pagina Ricerca: introduzione + trend colori stagionali
export function SearchPage({ onSearch, onCategory }) {
  const [q, setQ] = useState("");
  const COMPANIES = useCompanies();
  const trends = useTrends();
  return (
    <main className="pg">
      <section className="pg-hero">
        <FruitBackground />
        <p className="eyebrow"><span className="tick" aria-hidden="true">✦</span> Ricerca</p>
        <h1 className="page-h1">Trova il fornitore giusto,<br /><span className="accent">in poche parole.</span></h1>
        <p className="lead">
          Descrivi materiale, lavorazione o certificazione — "filato di lino GRS", "calze sportive",
          "stampa sublimatica". TEXA interpreta la richiesta, filtra {COMPANIES.length} fornitori
          verificati e li mostra su mappa, con contatti diretti e richiesta preventivo integrata.
        </p>
        <form className="searchbar" onSubmit={(e) => { e.preventDefault(); onSearch(q); }}>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Linen yarn, seamless, GRS recycled…" aria-label="Search" />
          <button type="submit">Search →</button>
        </form>
        <div className="chips" aria-label="Categorie">
          {CATEGORIES.map((c) => (
            <button key={c} className="chip" onClick={() => onCategory(c)}>{c}</button>
          ))}
        </div>
      </section>

      <TrendColors trends={trends} />
    </main>
  );
}
