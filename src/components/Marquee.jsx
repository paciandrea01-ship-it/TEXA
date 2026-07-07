import React from "react";
import { MARQUEE } from "../data/catalog.js";

export function Marquee({ reverse = false }) {
  return (
    <div className={"marquee" + (reverse ? " rev" : "")} aria-hidden="true">
      <div className="marquee-track">
        {[...MARQUEE, ...MARQUEE].map((w, i) => <span key={i}>{w}<em>✦</em></span>)}
      </div>
    </div>
  );
}
