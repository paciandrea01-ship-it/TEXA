import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

// ------------------------------------------------------------------
// Rubrica professionale dell'utente: fornitori seguiti, preferiti,
// da contattare, conversazioni, storico interazioni, badge fiere e
// ricerche recenti. Tutto salvato sul dispositivo (localStorage) —
// nessun dato fittizio: si parte vuoti e si riempie usando l'app.
// ------------------------------------------------------------------
const KEY = "texa.network.v1";

const EMPTY = { rel: {}, threads: {}, events: [], badges: [], searches: [] };

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return EMPTY;
    const j = JSON.parse(raw);
    return { ...EMPTY, ...j };
  } catch { return EMPTY; }
}

const now = () => new Date().toISOString();
export const fmtWhen = (iso) => new Date(iso).toLocaleDateString("it-IT", { day: "numeric", month: "short", year: "numeric" }) +
  " · " + new Date(iso).toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" });

export const REL_LABELS = { follow: "Seguito", fav: "Preferito", todo: "Da contattare" };

const Ctx = createContext(null);

export function NetworkProvider({ children }) {
  const [state, setState] = useState(load);

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* storage pieno o disabilitato */ }
  }, [state]);

  const api = useMemo(() => {
    const logEvent = (companyId, type, text) =>
      setState((s) => ({ ...s, events: [{ id: "e" + Date.now() + Math.random().toString(36).slice(2, 6), companyId, type, text, at: now() }, ...s.events].slice(0, 400) }));

    return {
      relOf: (id) => state.rel[id] || {},
      toggleRel: (id, kind, companyName) => {
        const cur = !!(state.rel[id] || {})[kind];
        setState((s) => {
          const r = { ...(s.rel[id] || {}), [kind]: !cur };
          return { ...s, rel: { ...s.rel, [id]: r } };
        });
        logEvent(id, kind, (cur ? "Rimosso da: " : "Aggiunto a: ") + REL_LABELS[kind] + (companyName ? " — " + companyName : ""));
      },
      addMessage: (id, text, companyName) => {
        setState((s) => {
          const t = s.threads[id] || [];
          return { ...s, threads: { ...s.threads, [id]: [...t, { id: "m" + Date.now(), text, at: now() }] } };
        });
        logEvent(id, "msg", "Messaggio" + (companyName ? " a " + companyName : "") + ": " + text.slice(0, 80));
      },
      addNote: (id, text, companyName) => logEvent(id, "note", text),
      logRfq: (id, companyName) => logEvent(id, "rfq", "Richiesta di preventivo inviata" + (companyName ? " a " + companyName : "")),
      addBadge: (b) => setState((s) => ({ ...s, badges: [{ id: "b" + Date.now(), savedAt: now(), ...b }, ...s.badges] })),
      removeBadge: (id) => setState((s) => ({ ...s, badges: s.badges.filter((b) => b.id !== id) })),
      logSearch: (q) => {
        const t = (q || "").trim();
        if (!t) return;
        setState((s) => ({ ...s, searches: [t, ...s.searches.filter((x) => x.toLowerCase() !== t.toLowerCase())].slice(0, 12) }));
      },
    };
  }, [state]);

  const value = useMemo(() => ({ ...state, ...api }), [state, api]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useNetwork = () => useContext(Ctx);
