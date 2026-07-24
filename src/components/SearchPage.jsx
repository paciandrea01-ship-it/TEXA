import React, { useState } from "react";
import { ROLE_CATEGORIES } from "../data/catalog.js";
import { useCompanies, useCategories } from "../state/companies.jsx";
import { AiAssistant } from "./AiAssistant.jsx";
import { FruitBackground } from "./FruitBackground.jsx";

// Pagina Ricerca: introduzione, categorie merceologiche + tipologie di
// operatore (barre scorrevoli) e assistente TEXA AI colori & tendenze
export function SearchPage({ onSearch, onCategory, onOpenCompany }) {
  const [q, setQ] = useState("");
  const COMPANIES = useCompanies();
  const CATEGORIES = useCategories();
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
        <div className="chips roles" aria-label="Tipologia di operatore">
          {ROLE_CATEGORIES.map((c) => (
            <button key={c} className="chip soft" onClick={() => onCategory(c)}>{c}</button>
          ))}
        </div>
      </section>

      <AiAssistant onSearch={onSearch} onOpenCompany={onOpenCompany} />
    </main>
  );
}
