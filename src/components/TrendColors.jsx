import React from "react";

export function TrendColors({ trends }) {
  const maxF = Math.max(...trends.colors.map((c) => c.freq));
  return (
    <section className="trend">
      <div className="trend-head">
        <h2>Trend colori</h2>
        <span className="trend-season">
          {trends.label} · {trends.live ? "aggiornato in automatico sulla data di oggi" : "ultima stagione disponibile"}
        </span>
      </div>
      <div className="trend-grid">
        <div className="trend-hero">
          <div className="trend-hero-swatch" style={{ background: trends.hero.hex }} />
          <div className="trend-hero-info">
            <span className="trend-flag">Colore della stagione</span>
            <h3>{trends.hero.name}</h3>
            <span className="trend-code">PANTONE {trends.hero.pantone} TCX</span>
            <p>{trends.hero.note}</p>
          </div>
        </div>
        <div className="trend-list">
          <p className="trend-sub">I colori più ricorrenti su magazine e passerelle, con il riferimento Pantone più vicino.</p>
          {trends.colors.map((c) => (
            <div key={c.name} className="trend-row">
              <span className="trend-dot" style={{ background: c.hex }} />
              <span className="trend-name">{c.name}</span>
              <span className="trend-bar"><i style={{ width: (c.freq / maxF) * 100 + "%", background: c.hex }} /></span>
              <span className="trend-pant">{c.pantone} TCX</span>
            </div>
          ))}
          <p className="trend-src">Fonti: {trends.sources}</p>
        </div>
      </div>
    </section>
  );
}
