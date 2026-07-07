// Cartelle colori deterministiche per azienda
export const SH = {
  ecru:       { n: "Ecru", p: "11-0809", h: "#F1EADA" },
  ivory:      { n: "Avorio", p: "11-0602", h: "#F7F3E8" },
  white:      { n: "Bianco ottico", p: "11-0601", h: "#F4F5F0" },
  sand:       { n: "Sabbia", p: "13-1010", h: "#DECAAF" },
  butter:     { n: "Burro", p: "12-0722", h: "#EFE1A7" },
  saffron:    { n: "Zafferano", p: "14-1064", h: "#F3A712" },
  camel:      { n: "Cammello", p: "17-1224", h: "#B0846A" },
  tobacco:    { n: "Tabacco", p: "17-1327", h: "#9A6B4F" },
  kraft:      { n: "Kraft", p: "16-1235", h: "#B3855C" },
  terracotta: { n: "Terracotta", p: "16-1526", h: "#C26E51" },
  scarlet:    { n: "Scarlatto", p: "18-1662", h: "#CD2C2E" },
  bordeaux:   { n: "Bordeaux", p: "19-1725", h: "#64313E" },
  blush:      { n: "Cipria", p: "13-1520", h: "#F2C4C2" },
  rose:       { n: "Rosa antico", p: "16-1518", h: "#C98D8D" },
  lilac:      { n: "Lilla", p: "15-3817", h: "#B9A6C9" },
  moss:       { n: "Muschio", p: "16-0421", h: "#8A8F5C" },
  sage:       { n: "Salvia", p: "15-6316", h: "#A3B5A0" },
  forest:     { n: "Bosco", p: "19-6110", h: "#35463D" },
  aqua:       { n: "Acqua", p: "12-4610", h: "#9BD4D8" },
  marine:     { n: "Marina", p: "17-4041", h: "#4F84C4" },
  denim:      { n: "Denim", p: "18-4025", h: "#4E6E94" },
  navy:       { n: "Navy", p: "19-4024", h: "#2A3958" },
  indigo:     { n: "Indaco", p: "19-3928", h: "#49516D" },
  grey:       { n: "Grigio melange", p: "16-3801", h: "#A7A2A0" },
  silver:     { n: "Argento", p: "14-5002", h: "#ADB0B2" },
  steel:      { n: "Acciaio", p: "18-4005", h: "#6E7376" },
  ink:        { n: "Nero inchiostro", p: "19-4007", h: "#2B2C30" },
};

export const SHADE_POOLS = {
  "Filati": [SH.ecru, SH.camel, SH.moss, SH.indigo, SH.terracotta, SH.grey, SH.bordeaux, SH.butter, SH.sand, SH.forest],
  "Tessuti": [SH.navy, SH.steel, SH.forest, SH.silver, SH.aqua, SH.ink, SH.denim, SH.moss, SH.white, SH.marine],
  "Calze & Calzetteria": [SH.white, SH.grey, SH.navy, SH.scarlet, SH.saffron, SH.aqua, SH.ink, SH.denim, SH.blush],
  "Abbigliamento & Intimo": [SH.blush, SH.ivory, SH.rose, SH.navy, SH.sand, SH.lilac, SH.grey, SH.bordeaux],
  "Stampa & Ricamo": [SH.scarlet, SH.marine, SH.saffron, SH.forest, SH.lilac, SH.ink, SH.aqua, SH.rose],
  "Confezioni & Servizi": [SH.ivory, SH.sand, SH.grey, SH.kraft, SH.steel, SH.white],
  "Packaging & Display": [SH.kraft, SH.ink, SH.white, SH.sand, SH.steel, SH.terracotta],
  "Macchinari": [SH.steel, SH.ink, SH.silver, SH.grey, SH.navy, SH.scarlet],
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
