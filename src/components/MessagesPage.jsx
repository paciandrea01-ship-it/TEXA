import React, { useState, useEffect, useRef } from "react";
import { COMPANIES } from "../data/companies.js";
import { CERT_LABELS } from "../data/catalog.js";
import { companyShades } from "../data/shades.js";
import { docsFor, download } from "../lib/docs.js";
import { PaletteDots, PaletteSquares } from "./ui/Palette.jsx";

export function MessagesPage({ threads, activeId, setActiveId, onSend, onStart, onOpenCompany }) {
  const [tab, setTab] = useState("chat");
  const [q, setQ] = useState("");
  const [draft, setDraft] = useState("");
  const endRef = useRef(null);
  const active = threads.find((t) => t.companyId === activeId);
  const company = COMPANIES.find((c) => c.id === activeId);
  const matches = q
    ? COMPANIES.filter((c) => (c.name + " " + c.speciality + " " + c.city).toLowerCase().includes(q.toLowerCase()) && !threads.some((t) => t.companyId === c.id)).slice(0, 5)
    : [];

  useEffect(() => { if (endRef.current) endRef.current.scrollIntoView({ block: "end" }); }, [threads, activeId, tab]);

  const send = () => {
    const t = draft.trim();
    if (!t || !company) return;
    onSend(company.id, t);
    setDraft("");
  };

  return (
    <main className="pg">
      <p className="eyebrow"><span className="tick" aria-hidden="true">✦</span> Messaggi</p>
      <h1 className="page-h1">Filo diretto <span className="accent">coi fornitori.</span></h1>

      <div className="msg-grid">
        <aside className="msg-side">
          <input className="msg-search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cerca un fornitore…" aria-label="Cerca fornitore" />
          {matches.length > 0 && (
            <div className="msg-new">
              {matches.map((c) => (
                <button key={c.id} onClick={() => { onStart(c.id); setQ(""); setTab("chat"); }}>
                  <span className="msg-name">{c.name}</span>
                  <PaletteDots c={c} n={4} />
                </button>
              ))}
            </div>
          )}
          {threads.map((t) => {
            const c = COMPANIES.find((x) => x.id === t.companyId);
            if (!c) return null;
            const last = t.msgs[t.msgs.length - 1];
            return (
              <button key={t.companyId} className={"msg-item" + (t.companyId === activeId ? " on" : "")}
                onClick={() => { setActiveId(t.companyId); setTab("chat"); }}>
                <span className="msg-item-top">
                  <span className="msg-name">{c.name}</span>
                  <PaletteDots c={c} n={4} />
                </span>
                <span className="msg-prev">{last ? last.text : "Nuova conversazione"}</span>
              </button>
            );
          })}
        </aside>

        {company && active ? (
          <section className="msg-chat">
            <div className="msg-head">
              <div>
                <h2>{company.name} <PaletteDots c={company} n={5} /></h2>
                <span className="msg-meta">{company.city} {company.province ? "(" + company.province + ")" : ""} · {company.category}</span>
              </div>
              <div className="msg-tabs" role="tablist">
                <button className={tab === "chat" ? "on" : ""} onClick={() => setTab("chat")}>Chat</button>
                <button className={tab === "profilo" ? "on" : ""} onClick={() => setTab("profilo")}>Profilo</button>
                <button className={tab === "documenti" ? "on" : ""} onClick={() => setTab("documenti")}>Certificazioni & Doc</button>
              </div>
            </div>

            {tab === "chat" && (
              <>
                <div className="msg-scroll">
                  {active.msgs.length === 0 && <p className="msg-empty">Scrivi il primo messaggio a {company.name}.</p>}
                  {active.msgs.map((m) => (
                    <div key={m.id} className={"bubble " + m.from}>
                      <p>{m.text}</p>
                      <span>{m.at}</span>
                    </div>
                  ))}
                  <div ref={endRef} />
                </div>
                <form className="msg-input" onSubmit={(e) => { e.preventDefault(); send(); }}>
                  <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder={"Scrivi a " + company.name + "…"} aria-label="Messaggio" />
                  <button type="submit" disabled={!draft.trim()}>Invia →</button>
                </form>
              </>
            )}

            {tab === "profilo" && (
              <div className="msg-panel">
                <p className="msg-desc">{company.description}</p>
                <div className="fmeta">
                  <p><span className="k">Categoria</span>{company.category}</p>
                  <p><span className="k">Specialità</span>{company.speciality}</p>
                  <p><span className="k">Sede</span>{company.address ? company.address + ", " : ""}{company.city} {company.province ? "(" + company.province + ")" : ""} · {company.country}</p>
                  {company.website && <p><span className="k">Sito</span><a href={company.website} target="_blank" rel="noreferrer">{company.website.replace(/^https?:\/\//, "")}</a></p>}
                  {company.emails[0] && <p><span className="k">Email</span><a href={"mailto:" + company.emails[0]}>{company.emails[0]}</a></p>}
                </div>
                <PaletteSquares c={company} />
                <button className="btn" onClick={() => onOpenCompany(company.id)}>Scheda completa →</button>
              </div>
            )}

            {tab === "documenti" && (
              <div className="msg-panel">
                <h3 className="msg-h3">Certificazioni</h3>
                {company.certifications.length > 0 ? (
                  <div className="tagrow">
                    {company.certifications.map((cert) => (
                      <span key={cert} className="cert big">{cert}<small>{CERT_LABELS[cert] || ""}</small></span>
                    ))}
                  </div>
                ) : (
                  <p className="msg-note">Nessuna certificazione registrata su TEXA. Richiedile in chat: GOTS, OEKO-TEX, GRS, ISO…</p>
                )}
                <h3 className="msg-h3">Documentazione scaricabile</h3>
                <div className="docs">
                  {docsFor(company).map((d) => (
                    <button key={d.id} className="doc" onClick={() => download(d.file, d.make())}>
                      <span className="doc-ic" aria-hidden="true">↓</span>
                      <span className="doc-name">{d.label}</span>
                      <span className="doc-type">{d.type}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </section>
        ) : (
          <section className="msg-chat msg-none"><p>Seleziona una conversazione o cerca un fornitore.</p></section>
        )}
      </div>
    </main>
  );
}
