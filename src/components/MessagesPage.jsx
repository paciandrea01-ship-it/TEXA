import React, { useMemo, useState } from "react";
import { CERT_LABELS } from "../data/catalog.js";
import { useCompanies } from "../state/companies.jsx";
import { useNetwork, fmtWhen } from "../state/network.jsx";
import { suggestContacts } from "../lib/ai.js";
import { docsFor, download } from "../lib/docs.js";
import { PaletteSquares } from "./ui/Palette.jsx";

// Rubrica professionale B2B: contatti salvati (seguiti, preferiti,
// da contattare), conversazioni e storico interazioni per fornitore.
// I dati arrivano da Supabase; la rubrica è salvata sul dispositivo.

const FILTERS = [
  { key: "tutti", label: "Tutti" },
  { key: "follow", label: "Seguiti" },
  { key: "fav", label: "Preferiti" },
  { key: "todo", label: "Da contattare" },
];

const EVT_ICON = { follow: "＋", fav: "★", todo: "☐", msg: "✉", rfq: "⇪", note: "✎" };

export function MessagesPage({ activeId, setActiveId, onOpenCompany }) {
  const [filter, setFilter] = useState("tutti");
  const [tab, setTab] = useState("chat");
  const [q, setQ] = useState("");
  const [draft, setDraft] = useState("");
  const [note, setNote] = useState("");

  const COMPANIES = useCompanies();
  const net = useNetwork();

  // Contatti in rubrica: aziende con una relazione attiva o una conversazione
  const contacts = useMemo(() => COMPANIES.filter((c) => {
    const r = net.rel[c.id] || {};
    return r.follow || r.fav || r.todo || (net.threads[c.id] || []).length > 0;
  }), [COMPANIES, net.rel, net.threads]);

  const shown = contacts.filter((c) => filter === "tutti" || (net.rel[c.id] || {})[filter]);

  const matches = q
    ? COMPANIES.filter((c) => (c.name + " " + c.speciality + " " + c.city).toLowerCase().includes(q.toLowerCase())).slice(0, 5)
    : [];

  const suggested = useMemo(
    () => suggestContacts(COMPANIES, net.searches, contacts.map((c) => c.id)),
    [COMPANIES, net.searches, contacts]
  );

  const company = COMPANIES.find((c) => c.id === activeId) || null;
  const rel = company ? net.relOf(company.id) : {};
  const msgs = company ? net.threads[company.id] || [] : [];
  const events = company ? net.events.filter((e) => e.companyId === company.id) : [];

  const send = () => {
    const t = draft.trim();
    if (!t || !company) return;
    net.addMessage(company.id, t, company.name);
    setDraft("");
  };
  const saveNote = () => {
    const t = note.trim();
    if (!t || !company) return;
    net.addNote(company.id, t, company.name);
    setNote("");
  };

  return (
    <main className="pg">
      <p className="eyebrow"><span className="tick" aria-hidden="true">✦</span> Messaggi & Rubrica</p>
      <h1 className="page-h1">La tua rete <span className="accent">professionale.</span></h1>
      <p className="lead">
        Segui i fornitori interessanti, salva i preferiti, tieni la lista di chi vuoi contattare
        e conserva conversazioni e storico dei rapporti commerciali. Tutto in un posto solo.
      </p>

      <div className="chips" role="tablist" aria-label="Filtri rubrica">
        {FILTERS.map((f) => (
          <button key={f.key} className={"chip" + (filter === f.key ? " on" : "")} onClick={() => setFilter(f.key)}>
            {f.label}{f.key !== "tutti" && <em className="chip-n">{contacts.filter((c) => (net.rel[c.id] || {})[f.key]).length}</em>}
          </button>
        ))}
      </div>

      <div className="msg-grid">
        <aside className="msg-side">
          <input className="msg-search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Aggiungi un fornitore…" aria-label="Cerca fornitore" />
          {matches.length > 0 && (
            <div className="msg-new">
              {matches.map((c) => (
                <button key={c.id} onClick={() => { setActiveId(c.id); setQ(""); setTab("chat"); }}>
                  <span className="msg-name">{c.name}</span>
                  <span className="ai-sup-meta">{c.city}</span>
                </button>
              ))}
            </div>
          )}

          {shown.length === 0 && (
            <div className="empty side">
              <p>Nessun contatto {filter !== "tutti" ? "in questa lista" : "in rubrica"}.</p>
              <p className="empty-sub">Cerca un fornitore qui sopra o dai risultati di ricerca e aggiungilo con ＋.</p>
            </div>
          )}
          {shown.map((c) => {
            const r = net.rel[c.id] || {};
            const t = net.threads[c.id] || [];
            const last = t[t.length - 1];
            return (
              <button key={c.id} className={"msg-item" + (c.id === activeId ? " on" : "")}
                onClick={() => { setActiveId(c.id); setTab("chat"); }}>
                <span className="msg-item-top">
                  <span className="msg-name">{c.name}</span>
                  <span className="rel-mini">
                    {r.follow && <i title="Seguito">＋</i>}{r.fav && <i title="Preferito">★</i>}{r.todo && <i title="Da contattare">☐</i>}
                  </span>
                </span>
                <span className="msg-prev">{last ? last.text : c.speciality || c.category}</span>
              </button>
            );
          })}

          {suggested.length > 0 && (
            <div className="suggest">
              <h3 className="msg-h3"><span className="ai-dot" aria-hidden="true" /> Suggeriti da TEXA AI</h3>
              {suggested.map(({ company: c, because }) => (
                <button key={c.id} className="msg-item" onClick={() => { setActiveId(c.id); setTab("profilo"); }}>
                  <span className="msg-item-top"><span className="msg-name">{c.name}</span></span>
                  <span className="msg-prev">In base alla tua ricerca "{because}"</span>
                </button>
              ))}
            </div>
          )}
        </aside>

        {company ? (
          <section className="msg-chat">
            <div className="msg-head">
              <div>
                <h2>{company.name}</h2>
                <span className="msg-meta">{company.city} {company.province ? "(" + company.province + ")" : ""} · {company.category}</span>
              </div>
              <div className="rel-btns" aria-label="Relazione">
                <button className={"rel-btn" + (rel.follow ? " on" : "")} onClick={() => net.toggleRel(company.id, "follow", company.name)}>＋ {rel.follow ? "Seguito" : "Segui"}</button>
                <button className={"rel-btn" + (rel.fav ? " on" : "")} onClick={() => net.toggleRel(company.id, "fav", company.name)}>★ Preferito</button>
                <button className={"rel-btn" + (rel.todo ? " on" : "")} onClick={() => net.toggleRel(company.id, "todo", company.name)}>☐ Da contattare</button>
              </div>
              <div className="msg-tabs" role="tablist">
                <button className={tab === "chat" ? "on" : ""} onClick={() => setTab("chat")}>Conversazione</button>
                <button className={tab === "storico" ? "on" : ""} onClick={() => setTab("storico")}>Storico</button>
                <button className={tab === "profilo" ? "on" : ""} onClick={() => setTab("profilo")}>Profilo</button>
                <button className={tab === "documenti" ? "on" : ""} onClick={() => setTab("documenti")}>Certificazioni & Doc</button>
              </div>
            </div>

            {tab === "chat" && (
              <>
                <div className="msg-scroll">
                  {msgs.length === 0 && <p className="msg-empty">Nessun messaggio: scrivi il primo appunto di conversazione con {company.name}.</p>}
                  {msgs.map((m) => (
                    <div key={m.id} className="bubble me">
                      <p>{m.text}</p>
                      <span>{fmtWhen(m.at)}</span>
                    </div>
                  ))}
                </div>
                <form className="msg-input" onSubmit={(e) => { e.preventDefault(); send(); }}>
                  <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder={"Scrivi a " + company.name + "…"} aria-label="Messaggio" />
                  <button type="submit" disabled={!draft.trim()}>Salva →</button>
                </form>
                <p className="msg-note pad">
                  I messaggi restano salvati nella tua rubrica.
                  {company.emails[0] && <> Per inviarli davvero: <a href={"mailto:" + company.emails[0] + "?subject=" + encodeURIComponent("Contatto da TEXA") + "&body=" + encodeURIComponent(draft || (msgs[msgs.length - 1] || {}).text || "")}>invia via email a {company.emails[0]} ↗</a></>}
                </p>
              </>
            )}

            {tab === "storico" && (
              <div className="msg-panel">
                <h3 className="msg-h3">Storico interazioni</h3>
                {events.length === 0 && <p className="msg-note">Ancora nessuna interazione registrata con {company.name}.</p>}
                <div className="evts">
                  {events.map((e) => (
                    <div key={e.id} className="evt">
                      <span className="evt-ic" aria-hidden="true">{EVT_ICON[e.type] || "•"}</span>
                      <span className="evt-txt">{e.text}</span>
                      <span className="evt-at">{fmtWhen(e.at)}</span>
                    </div>
                  ))}
                </div>
                <form className="msg-input flat" onSubmit={(e) => { e.preventDefault(); saveNote(); }}>
                  <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Aggiungi una nota (telefonata, incontro in fiera…)" aria-label="Nota" />
                  <button type="submit" disabled={!note.trim()}>Annota</button>
                </form>
              </div>
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
                  {company.phone && <p><span className="k">Tel</span>{company.phone}</p>}
                </div>
                {company.certifications.length > 0 && (
                  <div className="tagrow">
                    {company.certifications.map((cert) => (
                      <span key={cert} className="cert big">{cert}<small>{CERT_LABELS[cert] || ""}</small></span>
                    ))}
                  </div>
                )}
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
                  <p className="msg-note">Nessuna certificazione registrata su TEXA per questo fornitore. Richiedile in conversazione: GOTS, OEKO-TEX, GRS, ISO…</p>
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
          <section className="msg-chat msg-none"><p>Seleziona un contatto o cerca un fornitore da aggiungere alla rubrica.</p></section>
        )}
      </div>
    </main>
  );
}
