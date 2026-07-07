// Fiere internazionali + stato calcolato sulla data corrente
export const FAIRS = [
  { id: "mu43", name: "Milano Unica 43", city: "Milano", country: "Italia", venue: "Fiera Milano Rho",
    start: "2026-07-07", end: "2026-07-09", focus: "Tessuti e accessori di alta gamma",
    desc: "Il salone italiano del tessile: tessuti e accessori di alta gamma per le collezioni donna, uomo e bambino, con aree trend, focus sostenibilità e il progetto Made in Filo.",
    url: "https://www.milanounica.it" },
  { id: "itx26", name: "Intertextile Shanghai — Autumn", city: "Shanghai", country: "Cina", venue: "NECC — National Exhibition and Convention Center",
    start: "2026-08-25", end: "2026-08-27", focus: "Tessuti per abbigliamento",
    desc: "La più grande piattaforma mondiale per i tessuti da abbigliamento: oltre 3.000 espositori tra fibre, tessuti e accessori, con padiglioni internazionali e area sostenibilità.",
    url: "https://intertextile-shanghai-apparel-fabrics-autumn.hk.messefrankfurt.com/shanghai/en.html" },
  { id: "filo66", name: "Filo 66", city: "Milano", country: "Italia", venue: "Fiera Milano Rho",
    start: "2026-09-15", end: "2026-09-16", focus: "Filati e fibre per tessitura",
    desc: "La rassegna internazionale B2B dei filati e delle fibre per tessitura ortogonale e maglieria circolare: prodotto tecnico, anteprime colore e incontri diretti con le filature.",
    url: "https://filo.it" },
  { id: "pv26", name: "Première Vision Paris", city: "Parigi", country: "Francia", venue: "Parc des Expositions — Paris Nord Villepinte",
    start: "2026-09-15", end: "2026-09-17", focus: "Filati, tessuti, pelle e accessori",
    desc: "Il punto di riferimento europeo per i materiali moda: sei universi merceologici, seminari trend e il forum colore che orienta le collezioni delle stagioni successive.",
    url: "https://www.premierevision.com" },
  { id: "kp26", name: "Kingpins Amsterdam", city: "Amsterdam", country: "Paesi Bassi", venue: "Westergas",
    start: "2026-10-21", end: "2026-10-22", focus: "Denim e sportswear",
    desc: "Il boutique show del denim: tessitori, lavanderie e innovatori della filiera indigo, con un focus forte su circolarità e nuove finiture responsabili.",
    url: "https://www.kingpinsshow.com" },
  { id: "ispo26", name: "ISPO Munich", city: "Monaco di Baviera", country: "Germania", venue: "Messe München",
    start: "2026-12-01", end: "2026-12-03", focus: "Sport, outdoor e tessuti tecnici",
    desc: "Il più grande evento mondiale dello sport business: nell'area Textrends si presentano i tessuti tecnici e le membrane che definiranno le collezioni performance.",
    url: "https://www.ispo.com/en/munich" },
  { id: "ht27", name: "Heimtextil", city: "Francoforte", country: "Germania", venue: "Messe Frankfurt",
    start: "2027-01-12", end: "2027-01-15", focus: "Tessile casa e contract",
    desc: "La fiera internazionale del tessile per la casa e il contract: tendenze d'interni, fibre naturali e riciclate, con il Trend Space che apre l'anno tessile europeo.",
    url: "https://heimtextil.messefrankfurt.com" },
  { id: "pf100", name: "Pitti Filati 100", city: "Firenze", country: "Italia", venue: "Fortezza da Basso",
    start: "2027-01-27", end: "2027-01-29", focus: "Filati per maglieria",
    desc: "L'edizione numero 100 del salone internazionale dei filati per maglieria: le filature italiane presentano le collezioni e lo Spazio Ricerca detta i trend della stagione.",
    url: "https://filati.pittimmagine.com" },
  { id: "pf99", name: "Pitti Filati 99", city: "Firenze", country: "Italia", venue: "Fortezza da Basso",
    start: "2026-06-24", end: "2026-06-26", focus: "Filati per maglieria",
    desc: "Il salone internazionale di riferimento per i filati da maglieria: collezioni PE28, Spazio Ricerca e Fashion at Work alla Fortezza da Basso.",
    url: "https://filati.pittimmagine.com" },
  { id: "tt26", name: "Techtextil", city: "Francoforte", country: "Germania", venue: "Messe Frankfurt",
    start: "2026-04-21", end: "2026-04-24", focus: "Tessili tecnici e nonwoven",
    desc: "La fiera leader mondiale dei tessili tecnici e dei nonwoven: fibre high-tech, compositi e tessuti funzionali per dodici aree di applicazione.",
    url: "https://techtextil.messefrankfurt.com" },
];

export const MONTHS_IT = ["gen", "feb", "mar", "apr", "mag", "giu", "lug", "ago", "set", "ott", "nov", "dic"];

export function fairStatus(f, now = new Date()) {
  const s = new Date(f.start + "T00:00:00");
  const e = new Date(f.end + "T23:59:59");
  if (now > e) return { key: "done", label: "Conclusa" };
  if (now >= s) return { key: "live", label: "In corso" };
  return { key: "next", label: "Prossima", days: Math.ceil((s - now) / 86400000) };
}

export function sortFairs(list, now = new Date()) {
  const rank = { live: 0, next: 1, done: 2 };
  return [...list].sort((a, b) => {
    const ra = rank[fairStatus(a, now).key];
    const rb = rank[fairStatus(b, now).key];
    if (ra !== rb) return ra - rb;
    return ra === 2 ? b.start.localeCompare(a.start) : a.start.localeCompare(b.start);
  });
}

export function fmtRange(f) {
  const s = new Date(f.start + "T00:00:00");
  const e = new Date(f.end + "T00:00:00");
  if (s.getMonth() === e.getMonth()) return s.getDate() + "–" + e.getDate() + " " + MONTHS_IT[s.getMonth()] + " " + s.getFullYear();
  return s.getDate() + " " + MONTHS_IT[s.getMonth()] + " – " + e.getDate() + " " + MONTHS_IT[e.getMonth()] + " " + e.getFullYear();
}
