import React, { useMemo } from "react";
import { useCompanies, useCompaniesState } from "../state/companies.jsx";
import { matchesRole } from "../lib/search.js";

const AV_COLORS = ["#0E7A4E", "#2C5F9E", "#C9788D", "#E39A0B", "#6C3FB4", "#12484B"];

export const isConsulenteOrAgente = (c) => matchesRole(c, "Consulenti") || matchesRole(c, "Agenti");

// Pagina Consulenti & Agenti — solo anagrafiche reali dal database
// Supabase (categoria/specialità di consulenza o rappresentanza).
export function ConsultantsPage({ onOpenCompany }) {
  const companies = useCompanies();
  const { loading } = useCompaniesState();
  const people = useMemo(() => companies.filter(isConsulenteOrAgente), [companies]);

  return (
    <main className="pg">
      <p className="eyebrow"><span className="tick" aria-hidden="true">✦</span> Consulenti & Agenti</p>
      <h1 className="page-h1">Consulenti e agenti <span className="accent">al tuo fianco.</span></h1>
      <p className="lead">
        Consulenti, studi specializzati e agenti di rappresentanza registrati su TEXA:
        sostenibilità e certificazioni, sviluppo prodotto, sourcing, colore e distribuzione.
      </p>
      {!loading && people.length === 0 && (
        <div className="empty">
          <p>Nessun consulente o agente registrato al momento.</p>
          <p className="empty-sub">Compaiono qui quando vengono aggiunti al database Supabase (categoria "Consulenti" o "Agenti", o specialità equivalente).</p>
        </div>
      )}
      <div className="consult-row">
        {people.map((c, i) => {
          const initials = c.name.replace(/[^A-Za-z ]/g, "").split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
          return (
            <button key={c.id} className="consult-card" onClick={() => onOpenCompany && onOpenCompany(c.id)}>
              <span className="consult-av" style={{ background: AV_COLORS[i % AV_COLORS.length] }}>{initials}</span>
              <span className="consult-role">{c.speciality || c.category}</span>
              <span className="consult-name">{c.name}</span>
              <span className="consult-desc">{c.description}</span>
              <span className="consult-tags">{c.tags.slice(0, 4).map((t) => <span key={t}>{t}</span>)}</span>
            </button>
          );
        })}
      </div>
    </main>
  );
}
