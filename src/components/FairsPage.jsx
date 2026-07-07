import React, { useMemo } from "react";
import { FAIRS, MONTHS_IT, fairStatus, sortFairs, fmtRange } from "../data/fairs.js";
import { Badge } from "./ui/Badge.jsx";

export function FairsPage({ selected, setSelected }) {
  const now = new Date();
  const fairs = useMemo(() => sortFairs(FAIRS, now), []); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <main className="pg">
      <WavyTape className="tape-page" />
      <p className="eyebrow"><span className="tick" aria-hidden="true">✦</span> Fiere internazionali</p>
      <h1 className="page-h1">Il calendario del tessile,<br /><span className="accent">sempre aggiornato.</span></h1>
      <p className="lead">
        Le fiere internazionali di filati, tessuti e tecnologia. Lo stato di ogni evento si aggiorna
        in automatico sulla data di oggi; l'ingresso si prenota tramite il sistema di registrazione
        ufficiale di ciascuna fiera.
      </p>

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
                  <p className="fnote">La prenotazione avviene sul sistema di registrazione ufficiale della fiera.</p>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </main>
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
