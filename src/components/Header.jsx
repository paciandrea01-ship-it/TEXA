import React from "react";

// Header: menu a sinistra (con Home) · logo TEXA centrato · azioni a destra
export function Header({ view, onNav, onHome, rfqCount }) {
  const is = (v) => (view === v ? " on" : "");
  const searchOn = view === "search" || view === "results" || view === "company" ? " on" : "";
  return (
    <header className="hdr">
      <nav className="nav" aria-label="Sezioni">
        <button className={"nav-l" + (view === "home" ? " on" : "")} onClick={onHome}>Home</button>
        <button className={"nav-l" + searchOn} onClick={() => onNav("search")}>Ricerca</button>
        <button className={"nav-l" + is("fairs")} onClick={() => onNav("fairs")}>Fiere</button>
        <button className={"nav-l" + is("messages")} onClick={() => onNav("messages")}>Messaggi</button>
      </nav>
      <button className="logo" onClick={onHome}>TEXA</button>
      <div className="hdr-right">
        {rfqCount > 0 && <span className="rfq-pill">{rfqCount} RFQ</span>}
      </div>
    </header>
  );
}
