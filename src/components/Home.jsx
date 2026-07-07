import React, { useState, useMemo } from "react";
import { COMPANIES } from "../data/companies.js";
import { CATEGORIES, CATEGORY_SHADES, hexToRgb } from "../data/catalog.js";
import { FAIRS, fairStatus, sortFairs, fmtRange } from "../data/fairs.js";
import { Marquee } from "./Marquee.jsx";
import { FruitBackground } from "./FruitBackground.jsx";
import { Consultants } from "./Consultants.jsx";
import { Badge } from "./ui/Badge.jsx";

// Pagina iniziale (Index)
export function Home({ onSearch, onCategory, onFairs }) {
  const [q, setQ] = useState("");
  const nextFairs = useMemo(() => sortFairs(FAIRS).filter((f) => fairStatus(f).key !== "done").slice(0, 3), []);
  return (
    <main>
      <Marquee />

      <section className="hero">
        <p className="eyebrow"><span className="tick" aria-hidden="true">✦</span> Textile network & marketplace</p>
        <h1 className="mega">
          <span className="line l1">Search less.</span>
          <span className="line l2 hollow">Source better.</span>
        </h1>
        <form className="searchbar" onSubmit={(e) => { e.preventDefault(); onSearch(q); }}>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Linen yarn, seamless, GRS recycled…" aria-label="Search" />
          <button type="submit">Search →</button>
        </form>
        <p className="hint">
          <button className="hint-link" onClick={() => onSearch("filati di lino")}>filati di lino</button>
          <button className="hint-link" onClick={() => onSearch("calze sportive")}>calze sportive</button>
          <button className="hint-link" onClick={() => onSearch("recycled GRS")}>recycled GRS</button>
        </p>
      </section>

      <section className="index">
        <FruitBackground />
        <div className="index-head">
          <h2>Index</h2>
          <span className="index-sub">{COMPANIES.length} fornitori verificati</span>
        </div>
        <div className="cat-cards">
          {CATEGORIES.map((cat) => {
            const n = COMPANIES.filter((x) => x.category === cat).length;
            const sh = CATEGORY_SHADES[cat] || { bg: "#F2F3F0", fg: "#141414" };
            return (
              <button key={cat} className="cat-card" style={{ background: sh.bg, color: sh.fg }} onClick={() => onCategory(cat)}>
                <span className="cat-name">{cat.toLowerCase()}</span>
                <span className="cat-specs">
                  <span>{n} fornitori</span>
                  <span>RGB: {hexToRgb(sh.bg)}</span>
                  <span>HEX: {sh.bg}</span>
                  <span className="cat-arrow">Esplora ↗</span>
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <Consultants />

      <section className="fairs">
        <div className="index-head">
          <h2>Fiere</h2>
          <button className="see-all" onClick={onFairs}>Calendario completo →</button>
        </div>
        <div className="fair-row">
          {nextFairs.map((f) => {
            const st = fairStatus(f);
            return (
              <button key={f.id} className="fair-card" onClick={onFairs}>
                <span className="fair-top">
                  <span className="fair-name">{f.name}</span>
                  <Badge st={st} />
                </span>
                <span className="fair-meta">{fmtRange(f)} · {f.city}</span>
                <span className="fair-meta">{f.focus}</span>
              </button>
            );
          })}
        </div>
      </section>

      <Marquee reverse />
    </main>
  );
}
