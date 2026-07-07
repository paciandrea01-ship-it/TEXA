// Categorie, palette dell'index, etichette certificazioni, marquee

// Scala colori dell'Index (9 quadranti): sinistra→destra, riga per riga
// verdi · blu/azzurri · viola/lilla/rosa
export const INDEX_SCALE = [
  { bg: "#0A4733", fg: "#CDE97B" }, // verde scuro
  { bg: "#0E7A4E", fg: "#EAF7EE" }, // verde
  { bg: "#CEF17B", fg: "#1C4A2B" }, // verde chiaro
  { bg: "#22335F", fg: "#C9D8F4" }, // blu
  { bg: "#3E6FB0", fg: "#EAF2FC" }, // blu chiaro
  { bg: "#9BD4D8", fg: "#12484B" }, // azzurro
  { bg: "#6C3FB4", fg: "#EDE4FA" }, // viola
  { bg: "#B9A6C9", fg: "#3A2A52" }, // lilla
  { bg: "#F6CFD6", fg: "#8A3A4D" }, // rosa
];

export const CATEGORIES = [
  "Filati",
  "Tessuti",
  "Calze & Calzetteria",
  "Abbigliamento & Intimo",
  "Stampa & Ricamo",
  "Confezioni & Servizi",
  "Packaging & Display",
  "Macchinari",
];

export const CATEGORY_SHADES = {
  "Filati": { bg: "#0A4733", fg: "#CDE97B" },
  "Tessuti": { bg: "#22335F", fg: "#C9D8F4" },
  "Calze & Calzetteria": { bg: "#CEF17B", fg: "#1C4A2B" },
  "Abbigliamento & Intimo": { bg: "#F6CFD6", fg: "#8A3A4D" },
  "Stampa & Ricamo": { bg: "#F5CC55", fg: "#5F430E" },
  "Confezioni & Servizi": { bg: "#CDEDB3", fg: "#265B35" },
  "Packaging & Display": { bg: "#C4E2F4", fg: "#1D4E75" },
  "Macchinari": { bg: "#D9CDEE", fg: "#45306E" },
};

export const hexToRgb = (h) => {
  const n = parseInt(h.slice(1), 16);
  return (n >> 16) + ", " + ((n >> 8) & 255) + ", " + (n & 255);
};

export const CERT_LABELS = {
  GRS: "Global Recycled Standard",
  RWS: "Responsible Wool Standard",
  RMS: "Responsible Mohair Standard",
  GOTS: "Global Organic Textile Standard",
  "OEKO-TEX": "OEKO-TEX Standard 100",
  "ISO 9001": "Sistema di gestione qualità",
  BCI: "Better Cotton Initiative",
};

export const MARQUEE = ["LINEN", "MERINO", "GRS RECYCLED", "CASHMERE", "HEMP", "SEAMLESS", "MOHAIR", "JACQUARD", "ECONYL", "PIMA COTTON", "CHENILLE", "LYOCELL", "TECH YARNS", "MADE IN ITALY"];
