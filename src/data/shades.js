// Cartelle colori decorative per azienda: palette indicativa derivata
// dalla categoria (deterministica per id, così ogni scheda ha sempre
// gli stessi colori). Nessun codice colore commerciale.
export const SH = {
  ecru:       { n: "Ecru", h: "#F1EADA" },
  ivory:      { n: "Avorio", h: "#F7F3E8" },
  white:      { n: "Bianco ottico", h: "#F4F5F0" },
  sand:       { n: "Sabbia", h: "#DECAAF" },
  butter:     { n: "Burro", h: "#EFE1A7" },
  saffron:    { n: "Zafferano", h: "#F3A712" },
  camel:      { n: "Cammello", h: "#B0846A" },
  tobacco:    { n: "Tabacco", h: "#9A6B4F" },
  kraft:      { n: "Kraft", h: "#B3855C" },
  terracotta: { n: "Terracotta", h: "#C26E51" },
  scarlet:    { n: "Scarlatto", h: "#CD2C2E" },
  bordeaux:   { n: "Bordeaux", h: "#64313E" },
  blush:      { n: "Cipria", h: "#F2C4C2" },
  rose:       { n: "Rosa antico", h: "#C98D8D" },
  lilac:      { n: "Lilla", h: "#B9A6C9" },
  moss:       { n: "Muschio", h: "#8A8F5C" },
  sage:       { n: "Salvia", h: "#A3B5A0" },
  forest:     { n: "Bosco", h: "#35463D" },
  aqua:       { n: "Acqua", h: "#9BD4D8" },
  marine:     { n: "Marina", h: "#4F84C4" },
  denim:      { n: "Denim", h: "#4E6E94" },
  navy:       { n: "Navy", h: "#2A3958" },
  indigo:     { n: "Indaco", h: "#49516D" },
  grey:       { n: "Grigio melange", h: "#A7A2A0" },
  silver:     { n: "Argento", h: "#ADB0B2" },
  steel:      { n: "Acciaio", h: "#6E7376" },
  ink:        { n: "Nero inchiostro", h: "#2B2C30" },
};

// Palette per categoria: copre sia le categorie storiche sia quelle
// del database attuale (Produzione, Serigrafia, Cartotecnica, ecc.).
export const SHADE_POOLS = {
  "Filati": [SH.ecru, SH.camel, SH.moss, SH.indigo, SH.terracotta, SH.grey, SH.bordeaux, SH.butter, SH.sand, SH.forest],
  "Tessuti": [SH.navy, SH.steel, SH.forest, SH.silver, SH.aqua, SH.ink, SH.denim, SH.moss, SH.white, SH.marine],
  "Produzione": [SH.white, SH.grey, SH.navy, SH.scarlet, SH.saffron, SH.aqua, SH.ink, SH.denim, SH.blush],
  "Confezioni": [SH.ivory, SH.sand, SH.grey, SH.kraft, SH.steel, SH.white],
  "Serigrafia": [SH.scarlet, SH.marine, SH.saffron, SH.forest, SH.lilac, SH.ink, SH.aqua, SH.rose],
  "Tipografia": [SH.scarlet, SH.marine, SH.saffron, SH.ink, SH.white, SH.steel],
  "Cartotecnica": [SH.kraft, SH.ink, SH.white, SH.sand, SH.steel, SH.terracotta],
  "Accessori": [SH.silver, SH.ink, SH.camel, SH.bordeaux, SH.sand, SH.steel],
  "Macchinari": [SH.steel, SH.ink, SH.silver, SH.grey, SH.navy, SH.scarlet],
  "Agenti": [SH.navy, SH.grey, SH.ivory, SH.bordeaux, SH.steel, SH.sage],
  "Fiera": [SH.saffron, SH.marine, SH.scarlet, SH.aqua, SH.lilac, SH.white],
  "Calze & Calzetteria": [SH.white, SH.grey, SH.navy, SH.scarlet, SH.saffron, SH.aqua, SH.ink, SH.denim, SH.blush],
  "Abbigliamento & Intimo": [SH.blush, SH.ivory, SH.rose, SH.navy, SH.sand, SH.lilac, SH.grey, SH.bordeaux],
  "Stampa & Ricamo": [SH.scarlet, SH.marine, SH.saffron, SH.forest, SH.lilac, SH.ink, SH.aqua, SH.rose],
  "Confezioni & Servizi": [SH.ivory, SH.sand, SH.grey, SH.kraft, SH.steel, SH.white],
  "Packaging & Display": [SH.kraft, SH.ink, SH.white, SH.sand, SH.steel, SH.terracotta],
};

export function hashId(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

export function companyShades(c) {
  const pool = SHADE_POOLS[c.category] || SHADE_POOLS["Filati"];
  let seed = hashId(c.id);
  const rnd = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
  const arr = [...pool];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.slice(0, 4 + Math.floor(rnd() * 3));
}
