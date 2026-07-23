import React from "react";
import { CERT_LABELS } from "../data/catalog.js";
import { useNetwork } from "../state/network.jsx";

export function CompanyPage({ c, onBack, onRfq, onMessage, contactOpen, setContactOpen, rfqSent }) {
  const net = useNetwork();
  const rel = net.relOf(c.id);
  const initials = c.name.replace(/[^A-Za-z ]/g, "").split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
  return (
    <main className="co">
      <button className="back" onClick={onBack}>← Indietro</button>
      <div className="co-hero">
        <div className="mono" aria-hidden="true">{initials}</div>
        <div className="co-id">
          <span className="pill">{c.category}</span>
          <div className="co-name">
            <h1>{c.name}</h1>
          </div>
          <p className="co-loc">{c.address ? c.address + ", " : ""}{c.city} {c.province && "(" + c.province + ")"} · {c.country}</p>
          <div className="rel-btns" aria-label="Relazione">
            <button className={"rel-btn" + (rel.follow ? " on" : "")} onClick={() => net.toggleRel(c.id, "follow", c.name)}>＋ {rel.follow ? "Seguito" : "Segui"}</button>
            <button className={"rel-btn" + (rel.fav ? " on" : "")} onClick={() => net.toggleRel(c.id, "fav", c.name)}>★ Preferito</button>
            <button className={"rel-btn" + (rel.todo ? " on" : "")} onClick={() => net.toggleRel(c.id, "todo", c.name)}>☐ Da contattare</button>
          </div>
        </div>
        <div className="co-cta">
          <button className="btn primary" onClick={() => setContactOpen(!contactOpen)}>Contatta</button>
          <button className="btn" onClick={onMessage}>Messaggio</button>
          <button className="btn" onClick={onRfq}>Richiedi preventivo</button>
        </div>
      </div>

      {rfqSent && <div className="ok">Richiesta inviata a {c.name}. Riceverai risposta all'email indicata.</div>}

      {contactOpen && (
        <div className="contact-panel">
          {c.contactPerson && <p><span className="k">Referente</span>{c.contactPerson}</p>}
          {c.emails.length > 0 && <p><span className="k">Email</span>{c.emails.map((e) => <a key={e} href={"mailto:" + e}>{e}</a>)}</p>}
          {c.phone && <p><span className="k">Tel</span><a href={"tel:" + c.phone.replace(/[^\d+]/g, "")}>{c.phone}</a></p>}
          {c.website && <p><span className="k">Sito</span><a href={c.website} target="_blank" rel="noreferrer">{c.website.replace(/^https?:\/\//, "")}</a></p>}
          {c.emails.length === 0 && !c.phone && !c.website && <p>Contatto disponibile tramite richiesta di preventivo.</p>}
        </div>
      )}

      <section className="co-sec">
        <h2>Specializzazione</h2>
        <p className="co-desc">{c.description}</p>
        <div className="tagrow">{c.tags.map((t) => <span key={t} className="tag">{t}</span>)}</div>
      </section>

      {c.certifications.length > 0 && (
        <section className="co-sec">
          <h2>Certificazioni</h2>
          <div className="tagrow">
            {c.certifications.map((cert) => (
              <span key={cert} className="cert big">{cert}<small>{CERT_LABELS[cert] || ""}</small></span>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
