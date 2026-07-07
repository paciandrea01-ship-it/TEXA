import React from "react";
import { companyShades } from "../../data/shades.js";

export function PaletteDots({ c, n = 5 }) {
  return (
    <span className="pal" aria-label="Cartella colori">
      {companyShades(c).slice(0, n).map((s) => (
        <i key={s.n} style={{ background: s.h }} title={s.n + " · " + s.p + " TCX"} />
      ))}
    </span>
  );
}

export function PaletteSquares({ c }) {
  return (
    <div className="sq-row" aria-hidden="true">
      {companyShades(c).map((s) => <span key={s.n} style={{ background: s.h }} />)}
    </div>
  );
}
