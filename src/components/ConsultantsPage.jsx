import React from "react";
import { CONSULTANTS } from "../data/consultants.js";

// Pagina Consulenti — elenco degli advisor (raggiunta dal 9° quadrante
// dell'Index o cercando "consulenti").
export function ConsultantsPage() {
  return (
    <main className="pg">
      <p className="eyebrow"><span className="tick" aria-hidden="true">✦</span> Consulenti</p>
      <h1 className="page-h1">Gli advisor <span className="accent">al tuo fianco.</span></h1>
      <p className="lead">
        Esperti TEXA che affiancano brand e uffici stile: sostenibilità e certificazioni,
        sviluppo prodotto, sourcing e colore. Scrivi a chi ti serve per il tuo progetto.
      </p>
      <div className="consult-row">
        {CONSULTANTS.map((c) => {
          const initials = c.name.split(" ").map((w) => w[0]).join("").toUpperCase();
          return (
            <div key={c.id} className="consult-card">
              <span className="consult-av" style={{ background: c.color }}>{initials}</span>
              <span className="consult-role">{c.role}</span>
              <span className="consult-name">{c.name}</span>
              <span className="consult-desc">{c.desc}</span>
              <span className="consult-tags">{c.tags.map((t) => <span key={t}>{t}</span>)}</span>
            </div>
          );
        })}
      </div>
    </main>
  );
}
