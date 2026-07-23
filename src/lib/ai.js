// ------------------------------------------------------------------
// TEXA AI — motore dei suggerimenti: analisi dei trend cromatici
// (stagione, mercato, storico), materiali correlati e contatti
// consigliati. Lavora solo su dati reali: l'archivio trend interno
// e le aziende caricate da Supabase.
// ------------------------------------------------------------------
import { TREND_SEASONS, seasonOrder, seasonKey } from "../data/trends.js";
import { searchCompanies } from "./search.js";

export const MARKETS = [
  { key: "tutti", label: "Tutti i mercati", hint: "", cats: [] },
  { key: "maglieria", label: "Maglieria", hint: "filati per maglieria", cats: ["Filati"] },
  { key: "tessuti", label: "Tessuti & Abbigliamento", hint: "tessuti", cats: ["Tessuti", "Abbigliamento & Intimo"] },
  { key: "sport", label: "Sport & Tech", hint: "tessuti tecnici performance", cats: ["Tessuti", "Calze & Calzetteria"] },
  { key: "intimo", label: "Intimo & Beachwear", hint: "intimo seamless beachwear", cats: ["Abbigliamento & Intimo", "Calze & Calzetteria"] },
  { key: "stampa", label: "Stampa & Ricamo", hint: "stampa ricamo", cats: ["Stampa & Ricamo"] },
];

const prevKeys = (key) => {
  const keys = seasonOrder();
  const i = keys.indexOf(key);
  return {
    prev: i > 0 ? keys[i - 1] : null,                                   // stagione precedente
    lastYear: keys.filter((k) => k.startsWith(key.slice(0, 2)))         // stessa stagione, anno prima
      .filter((k) => k < key).pop() || null,
  };
};

// Analisi computata sull'archivio: confronta la stagione scelta con la
// stessa stagione dell'anno precedente e con la stagione precedente.
export function seasonAnalysis(key) {
  const cur = TREND_SEASONS[key];
  if (!cur) return [];
  const { prev, lastYear } = prevKeys(key);
  const names = (k) => (TREND_SEASONS[k] ? TREND_SEASONS[k].colors.map((c) => c.name) : []);
  const out = [];

  if (lastYear) {
    const keep = cur.colors.filter((c) => names(lastYear).includes(c.name)).map((c) => c.name);
    const fresh = cur.colors.filter((c) => !names(lastYear).includes(c.name) && (!prev || !names(prev).includes(c.name))).map((c) => c.name);
    if (keep.length > 0) out.push("Confermati rispetto a " + TREND_SEASONS[lastYear].label + ": " + keep.join(", ") + ".");
    if (fresh.length > 0) out.push("Novità della stagione: " + fresh.join(", ") + ".");
  }
  if (prev) {
    const carry = cur.colors.filter((c) => names(prev).includes(c.name));
    carry.forEach((c) => {
      const before = TREND_SEASONS[prev].colors.find((x) => x.name === c.name);
      if (before && c.freq > before.freq) out.push(c.name + " è in crescita: da " + before.freq + " a " + c.freq + " presenze rilevate rispetto a " + TREND_SEASONS[prev].label + ".");
    });
  }
  const top = cur.colors[0];
  if (top) out.push("Il colore più ricorrente della stagione è " + top.name + ", guidato dal tema \"" + cur.hero.name + "\".");
  return out;
}

// Consigli d'uso per mercato (regole editoriali, non dati inventati)
export function marketAdvice(marketKey, season) {
  const warm = season && /FW/.test(season.key);
  switch (marketKey) {
    case "maglieria": return "Per la maglieria punta sui toni " + (warm ? "caldi e materici su lane, cashmere e mohair" : "polverosi su cotoni, lini e mischie leggere") + "; i colori in cartella rendono bene su punti a coste e jacquard.";
    case "tessuti": return "Su tessuti ortogonali e jersey i colori guida funzionano in tinta unita; usa i toni secondari della cartella per righe e fantasie.";
    case "sport": return "Per sport e tech usa il colore guida come base e gli accenti più saturi della cartella per dettagli, zip e loghi ad alta visibilità.";
    case "intimo": return "Per intimo e beachwear privilegia i toni morbidi della cartella; gli accenti scuri lavorano bene su bordi ed elastici.";
    case "stampa": return "In stampa e ricamo combina il colore guida con i due accenti più contrastanti della cartella per grafiche a 3 colori.";
    default: return "Seleziona un mercato per avere consigli d'uso mirati sulla cartella colori.";
  }
}

// Fornitori pertinenti per mercato/stagione, presi dal database reale.
export function suggestSuppliers(companies, marketKey, limit = 4) {
  const m = MARKETS.find((x) => x.key === marketKey);
  if (!m || m.cats.length === 0) return (companies || []).slice(0, 0);
  const pool = (companies || []).filter((c) => m.cats.includes(c.category));
  const scored = m.hint ? searchCompanies(pool, m.hint, null) : pool;
  return (scored.length > 0 ? scored : pool).slice(0, limit);
}

// Materiali correlati: amplia la ricerca con alternative pertinenti.
export const RELATED_MATERIALS = {
  lino: ["canapa", "cotone"], linen: ["hemp", "cotone"], canapa: ["lino", "lyocell"], hemp: ["lino", "lyocell"],
  cotone: ["lino", "lyocell"], cotton: ["lino", "lyocell"],
  lana: ["merino", "cashmere", "mohair"], wool: ["merino", "cashmere"], merino: ["lana", "cashmere"],
  cashmere: ["lana", "mohair", "seta"], mohair: ["lana", "alpaca"], alpaca: ["lana", "mohair"],
  seta: ["viscosa", "lyocell"], silk: ["viscosa", "lyocell"], viscosa: ["lyocell", "seta"],
  nylon: ["poliestere", "econyl"], poliestere: ["nylon", "riciclat"], econyl: ["nylon", "riciclat"],
  riciclat: ["econyl", "grs"], recycled: ["econyl", "grs"], lyocell: ["viscosa", "bamboo"], bamboo: ["lyocell", "cotone"],
};

export function relatedSearches(intent) {
  if (!intent) return [];
  const out = [];
  intent.materials.forEach((m) => (RELATED_MATERIALS[m] || []).forEach((r) => { if (!out.includes(r) && !intent.materials.includes(r)) out.push(r); }));
  return out.slice(0, 4);
}

// Contatti consigliati: incrocia le ricerche recenti dell'utente con il
// database reale, escludendo chi è già in rubrica.
export function suggestContacts(companies, searches, excludeIds, limit = 3) {
  const seen = new Set(excludeIds || []);
  const out = [];
  for (const q of searches || []) {
    for (const c of searchCompanies(companies, q, null)) {
      if (!seen.has(c.id)) { seen.add(c.id); out.push({ company: c, because: q }); }
      if (out.length >= limit) return out;
    }
  }
  return out;
}

export const currentSeasonKey = seasonKey;
