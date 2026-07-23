import React, { useMemo, useState } from "react";
import { FAIRS, MONTHS_IT, fairStatus, sortFairs, fmtRange } from "../data/fairs.js";
import { useNetwork, fmtWhen } from "../state/network.jsx";
import { Badge } from "./ui/Badge.jsx";

export function FairsPage({ selected, setSelected }) {
  const now = new Date();
  const fairs = useMemo(() => sortFairs(FAIRS, now), []); // eslint-disable-line react-hooks/exhaustive-deps
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [prefill, setPrefill] = useState("");

  const saveBadgeFor = (fairName) => { setPrefill(fairName); setDrawerOpen(true); window.scrollTo({ top: 0, behavior: "smooth" }); };

  return (
    <main className="pg">
      <p className="eyebrow"><span className="tick" aria-hidden="true">✦</span> Fiere internazionali</p>
      <h1 className="page-h1">Il calendario del tessile,<br /><span className="accent">sempre aggiornato.</span></h1>
      <p className="lead">
        Le fiere internazionali di filati, tessuti e tecnologia. Lo stato di ogni evento si aggiorna
        in automatico sulla data di oggi; l'ingresso si prenota tramite il sistema di registrazione
        ufficiale di ciascuna fiera.
      </p>

      <BadgeDrawer open={drawerOpen} setOpen={setDrawerOpen} prefill={prefill} setPrefill={setPrefill} />

      <FairCalendar fairs={fairs} now={now} selected={selected} onPick={(id) => setSelected(id === selected ? null : id)} />

      <div className="fair-list">
        {fairs.map((f) => {
          const st = fairStatus(f, now);
          const open = selected === f.id;
          return (
            <article key={f.id} className={"fitem" + (st.key === "done" ? " done" : "")}>
              <button className="fitem-top" onClick={() => setSelected(open ? null : f.id)} aria-expanded={open}>
                <span className="fdate">{fmtRange(f)}</span>
                <span className="fname">{f.name}</span>
                <Badge st={st} />
                <span className="floc">{f.city}</span>
                <span className="row-arrow" aria-hidden="true">{open ? "↓" : "↗"}</span>
              </button>
              {open && (
                <div className="fdetail">
                  <p className="fdesc">{f.desc}</p>
                  <div className="fmeta">
                    <p><span className="k">Focus</span>{f.focus}</p>
                    <p><span className="k">Sede</span>{f.venue}, {f.city} · {f.country}</p>
                    <p><span className="k">Date</span>{fmtRange(f)}{st.key === "next" && st.days != null && <> · tra {st.days} giorni</>}</p>
                  </div>
                  {st.key !== "done" ? (
                    <a className="btn primary" href={f.url} target="_blank" rel="noreferrer">Prenota l'ingresso ↗</a>
                  ) : (
                    <a className="btn" href={f.url} target="_blank" rel="noreferrer">Sito ufficiale ↗</a>
                  )}
                  <button className="btn" onClick={() => saveBadgeFor(f.name)}>🎫 Salva badge</button>
                  <p className="fnote">La prenotazione avviene sul sistema di registrazione ufficiale della fiera. Il badge ricevuto puoi archiviarlo qui in "I miei badge".</p>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </main>
  );
}

// Cassettino "I miei badge": archivia e ritrova i badge delle fiere
// visitate (nominativo, codice di registrazione, note). Salvati sul
// dispositivo insieme alla rubrica.
function BadgeDrawer({ open, setOpen, prefill, setPrefill }) {
  const net = useNetwork();
  const [fair, setFair] = useState("");
  const [holder, setHolder] = useState("");
  const [code, setCode] = useState("");
  const [note, setNote] = useState("");
  const [copied, setCopied] = useState(null);

  const fairName = prefill || fair;

  const save = (e) => {
    e.preventDefault();
    if (!fairName.trim() || !code.trim()) return;
    net.addBadge({ fair: fairName.trim(), holder: holder.trim(), code: code.trim(), note: note.trim() });
    setFair(""); setHolder(""); setCode(""); setNote(""); setPrefill("");
  };
  const copy = (b) => {
    try { navigator.clipboard.writeText(b.code); setCopied(b.id); setTimeout(() => setCopied(null), 1500); } catch { /* clipboard non disponibile */ }
  };

  return (
    <section className="bdg">
      <button className="bdg-toggle" onClick={() => setOpen(!open)} aria-expanded={open}>
        <span className="bdg-title">🎫 I miei badge</span>
        <span className="bdg-count">{net.badges.length} salvat{net.badges.length === 1 ? "o" : "i"}</span>
        <span className="row-arrow" aria-hidden="true">{open ? "↓" : "↗"}</span>
      </button>

      {open && (
        <div className="bdg-body">
          <div className="bdg-list">
            <h3 className="msg-h3">Controlla i tuoi badge</h3>
            {net.badges.length === 0 && <p className="msg-note">Nessun badge archiviato: salva qui il codice di registrazione della prossima fiera e lo ritrovi all'ingresso.</p>}
            {net.badges.map((b) => (
              <div key={b.id} className="bdg-card">
                <div className="bdg-info">
                  <span className="msg-name">{b.fair}</span>
                  <span className="bdg-code">{b.code}</span>
                  {b.holder && <span className="ai-sup-meta">{b.holder}</span>}
                  {b.note && <span className="ai-sup-meta">{b.note}</span>}
                  <span className="evt-at">salvato {fmtWhen(b.savedAt)}</span>
                </div>
                <div className="bdg-actions">
                  <button className="btn sm" onClick={() => copy(b)}>{copied === b.id ? "Copiato ✓" : "Copia codice"}</button>
                  <button className="btn sm danger" onClick={() => net.removeBadge(b.id)}>Elimina</button>
                </div>
              </div>
            ))}
          </div>

          <form className="bdg-form" onSubmit={save}>
            <h3 className="msg-h3">Salva un badge</h3>
            <label>Fiera
              <input list="texa-fairs" value={fairName} onChange={(e) => { setPrefill(""); setFair(e.target.value); }} placeholder="Milano Unica, Pitti Filati…" required />
              <datalist id="texa-fairs">
                {FAIRS.map((f) => <option key={f.id} value={f.name} />)}
              </datalist>
            </label>
            <label>Nominativo sul badge
              <input value={holder} onChange={(e) => setHolder(e.target.value)} placeholder="Nome e cognome / azienda" />
            </label>
            <label>Codice / numero badge
              <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Codice di registrazione" required />
            </label>
            <label>Note
              <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Edizione, padiglione, link e-ticket…" />
            </label>
            <button className="btn primary" type="submit" disabled={!fairName.trim() || !code.trim()}>Salva badge</button>
          </form>
        </div>
      )}
    </section>
  );
}

function FairCalendar({ fairs, now, selected, onPick }) {
  const months = useMemo(() => {
    const keys = fairs.map((f) => f.start.slice(0, 7)).sort();
    let [y, m] = keys[0].split("-").map(Number);
    const [ly, lm] = keys[keys.length - 1].split("-").map(Number);
    const out = [];
    while (y < ly || (y === ly && m <= lm)) {
      out.push({ y, m });
      m++; if (m > 12) { m = 1; y++; }
    }
    return out;
  }, [fairs]);
  const curKey = now.getFullYear() + "-" + String(now.getMonth() + 1).padStart(2, "0");
  return (
    <div className="cal" role="list" aria-label="Calendario degli eventi">
      {months.map(({ y, m }) => {
        const key = y + "-" + String(m).padStart(2, "0");
        const evs = fairs.filter((f) => f.start.slice(0, 7) === key);
        return (
          <div key={key} className={"cal-m" + (key === curKey ? " now" : "")} role="listitem">
            <span className="cal-lab">{MONTHS_IT[m - 1]} <em>{String(y).slice(2)}</em></span>
            <div className="cal-evs">
              {evs.map((f) => {
                const st = fairStatus(f, now);
                return (
                  <button key={f.id} className={"cal-ev " + st.key + (selected === f.id ? " sel" : "")}
                    onClick={() => onPick(f.id)} title={f.name + " · " + fmtRange(f)}>
                    {f.name.split(" ").slice(0, 2).join(" ")}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
