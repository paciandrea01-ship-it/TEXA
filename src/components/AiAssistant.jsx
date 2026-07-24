import React, { useMemo, useState } from "react";
import { TREND_SEASONS, seasonOrder, getTrends } from "../data/trends.js";
import { MARKETS, seasonAnalysis, marketAdvice, suggestSuppliers } from "../lib/ai.js";
import { useCompanies } from "../state/companies.jsx";

// TEXA AI — Colori & tendenze: cartella della stagione scelta (corrente
// o archivio anni precedenti), analisi computata sullo storico e
// fornitori pertinenti dal database reale.
export function AiAssistant({ onSearch, onOpenCompany }) {
  const companies = useCompanies();
  const current = useMemo(() => getTrends(), []);
  const [key, setKey] = useState(current.key);
  const [market, setMarket] = useState("tutti");

  const season = { key, ...TREND_SEASONS[key] };
  const maxF = Math.max(...season.colors.map((c) => c.freq));
  const analysis = useMemo(() => seasonAnalysis(key), [key]);
  const suppliers = useMemo(() => suggestSuppliers(companies, market), [companies, market]);
  const keys = useMemo(() => seasonOrder().slice().reverse(), []);

  return (
    <section className="trend ai-sec">
      <div className="trend-head">
        <h2><span className="ai-dot" aria-hidden="true" /> TEXA AI — Colori & tendenze</h2>
        <span className="trend-season">{season.label}{key === current.key ? " · stagione corrente" : " · archivio"}</span>
      </div>

      <div className="ai-controls">
        <div className="chips ai-seasons" aria-label="Stagione">
          {keys.map((k) => (
            <button key={k} className={"chip" + (k === key ? " on" : "")} onClick={() => setKey(k)}>
              {TREND_SEASONS[k].label.replace("Primavera / Estate", "P/E").replace("Autunno / Inverno", "A/I")}
            </button>
          ))}
        </div>
        <div className="chips ai-markets" aria-label="Mercato">
          {MARKETS.map((m) => (
            <button key={m.key} className={"chip soft" + (m.key === market ? " on" : "")} onClick={() => setMarket(m.key)}>{m.label}</button>
          ))}
        </div>
      </div>

      <div className="trend-grid">
        <div className="trend-hero">
          <div className="trend-hero-swatch" style={{ background: season.hero.hex }} />
          <div className="trend-hero-info">
            <span className="trend-flag">Colore guida della stagione</span>
            <h3>{season.hero.name}</h3>
            <span className="trend-code">{season.hero.hex}</span>
            <p>{season.hero.note}</p>
          </div>
        </div>
        <div className="trend-list">
          <p className="trend-sub">I colori più ricorrenti su passerelle e magazine per {season.label.toLowerCase()}.</p>
          {season.colors.map((c) => (
            <div key={c.name} className="trend-row">
              <span className="trend-dot" style={{ background: c.hex }} />
              <span className="trend-name">{c.name}</span>
              <span className="trend-bar"><i style={{ width: (c.freq / maxF) * 100 + "%", background: c.hex }} /></span>
              <span className="trend-pant">{c.hex}</span>
            </div>
          ))}
          <p className="trend-src">Elaborazione TEXA AI sull'archivio trend {keys[keys.length - 1].slice(3)}–{keys[0].slice(3)}.</p>
        </div>
      </div>

      <div className="ai-grid">
        <div className="ai-box">
          <h3 className="msg-h3">Analisi del trend</h3>
          {analysis.map((a, i) => <p key={i} className="ai-line">{a}</p>)}
          <p className="ai-line adv">{marketAdvice(market, season)}</p>
        </div>
        <div className="ai-box">
          <h3 className="msg-h3">Fornitori pertinenti</h3>
          {suppliers.length > 0 ? suppliers.map((c) => (
            <button key={c.id} className="ai-sup" onClick={() => onOpenCompany(c.id)}>
              <span className="msg-name">{c.name}</span>
              <span className="ai-sup-meta">{c.category} · {c.city}</span>
            </button>
          )) : (
            <p className="ai-line">Scegli un mercato per vedere i fornitori consigliati dal database TEXA.</p>
          )}
          {market !== "tutti" && (
            <button className="see-all" onClick={() => onSearch((MARKETS.find((m) => m.key === market) || {}).hint || "")}>
              Tutti i fornitori per questo mercato →
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
