import React from "react";
import { CONSULTANTS } from "../data/consultants.js";

// Sezione Consulenti (Index): advisor della piattaforma
export function Consultants() {
  return (
    <section className="consult">
      <div className="index-head">
        <h2>Consulenti</h2>
        <span className="index-sub">Advisor TEXA per il tuo progetto</span>
      </div>
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
    </section>
  );
}
