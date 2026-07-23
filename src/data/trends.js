// Trend colori — stagione corrente calcolata sulla data + archivio
// delle stagioni precedenti (elaborazione TEXA AI su passerelle,
// magazine e report di tendenza del settore).

export function seasonKey(d = new Date()) {
  const m = d.getMonth(), y = d.getFullYear();
  if (m >= 2 && m <= 7) return "SS-" + y;           // mar–ago → Primavera/Estate
  return "FW-" + (m <= 1 ? y - 1 : y);              // set–feb → Autunno/Inverno
}

export const TREND_SEASONS = {
  "SS-2024": {
    label: "Primavera / Estate 2024",
    hero: {
      name: "Peach Fuzz", hex: "#FFBE98",
      note: "Colore dell'anno 2024: un pesca morbido e avvolgente che ha spinto tutta la gamma dei rosati caldi su maglieria e jersey leggeri.",
    },
    colors: [
      { name: "Peach Fuzz", hex: "#FFBE98", freq: 85 },
      { name: "Halogen Blue", hex: "#BDC6DC", freq: 71 },
      { name: "Lemon Drop", hex: "#FDD878", freq: 66 },
      { name: "Watercress", hex: "#748C69", freq: 58 },
      { name: "Chambray Blue", hex: "#9EB4D3", freq: 52 },
      { name: "Desert Flower", hex: "#FF9B85", freq: 47 },
      { name: "Bianco ottico", hex: "#F4F5F0", freq: 43 },
    ],
  },
  "FW-2024": {
    label: "Autunno / Inverno 2024-25",
    hero: {
      name: "Bordeaux profondo", hex: "#64313E",
      note: "La stagione dei rossi scuri: bordeaux e ciliegia matura su lane, velluti e maglieria pesante, scaldati da cioccolato e verde bosco.",
    },
    colors: [
      { name: "Bordeaux profondo", hex: "#64313E", freq: 83 },
      { name: "Cioccolato", hex: "#5B3A29", freq: 74 },
      { name: "Verde bosco", hex: "#35463D", freq: 65 },
      { name: "Burro", hex: "#EFE1A7", freq: 57 },
      { name: "Denim scuro", hex: "#4E6E94", freq: 50 },
      { name: "Grigio flanella", hex: "#838487", freq: 45 },
      { name: "Ciliegia", hex: "#9B1B30", freq: 41 },
    ],
  },
  "SS-2025": {
    label: "Primavera / Estate 2025",
    hero: {
      name: "Mocha Mousse", hex: "#A47864",
      note: "Colore dell'anno 2025: un marrone caldo e cremoso che ha portato i neutri golosi anche nella stagione calda, abbinato a giallo burro e pistacchio.",
    },
    colors: [
      { name: "Butter Yellow", hex: "#F3E3A9", freq: 80 },
      { name: "Mocha Mousse", hex: "#A47864", freq: 75 },
      { name: "Pistacchio", hex: "#A8C09A", freq: 63 },
      { name: "Rosa cipria", hex: "#F2C4C2", freq: 59 },
      { name: "Azzurro polvere", hex: "#AFC7E8", freq: 54 },
      { name: "Ciliegia", hex: "#9B1B30", freq: 48 },
      { name: "Lilla", hex: "#B9A6C9", freq: 42 },
    ],
  },
  "FW-2025": {
    label: "Autunno / Inverno 2025-26",
    hero: {
      name: "Cioccolato fondente", hex: "#4A2F27",
      note: "I marroni conquistano la stagione fredda: dal cacao al tabacco, su cappotti, cashmere e superfici spazzolate, con accenti burro e verde oliva.",
    },
    colors: [
      { name: "Cioccolato fondente", hex: "#4A2F27", freq: 84 },
      { name: "Tabacco", hex: "#9A6B4F", freq: 72 },
      { name: "Butter Yellow", hex: "#F3E3A9", freq: 64 },
      { name: "Verde oliva", hex: "#6B6B45", freq: 58 },
      { name: "Bordeaux profondo", hex: "#64313E", freq: 53 },
      { name: "Grigio ghiaccio", hex: "#C9CDD1", freq: 46 },
      { name: "Blu notte", hex: "#2A3958", freq: 42 },
    ],
  },
  "SS-2026": {
    label: "Primavera / Estate 2026",
    hero: {
      name: "Cloud Dancer", hex: "#F0EEE4",
      note: "Colore dell'anno 2026: un bianco morbido e luminoso, simbolo di leggerezza, calma e nuovo minimalismo. Perfetto su tailoring pulito, lini e cotoni.",
    },
    colors: [
      { name: "Marina", hex: "#4F84C4", freq: 82 },
      { name: "Tickled Pink", hex: "#F5B0C2", freq: 74 },
      { name: "Butter Yellow", hex: "#F3E3A9", freq: 69 },
      { name: "Acacia", hex: "#DCC94C", freq: 61 },
      { name: "Acqua", hex: "#9BD4D8", freq: 55 },
      { name: "Apricot Crush", hex: "#EF8E63", freq: 48 },
      { name: "Mocha Mousse", hex: "#A47864", freq: 40 },
    ],
  },
  "FW-2026": {
    label: "Autunno / Inverno 2026-27",
    hero: {
      name: "Chicory Coffee", hex: "#53352E",
      note: "Il marrone profondo guida la stagione fredda: caldo e materico, valorizza lane, cashmere e superfici spazzolate.",
    },
    colors: [
      { name: "Tawny Port", hex: "#64313E", freq: 84 },
      { name: "Deep Forest", hex: "#35463D", freq: 76 },
      { name: "Butter Yellow", hex: "#F3E3A9", freq: 64 },
      { name: "Sharkskin", hex: "#838487", freq: 58 },
      { name: "French Blue", hex: "#3E6FB0", freq: 51 },
      { name: "Winter White", hex: "#F2EFE4", freq: 46 },
      { name: "Chili Pepper", hex: "#9B1B30", freq: 41 },
    ],
  },
};

// Chiavi in ordine cronologico (SS prima di FW nello stesso anno)
export function seasonOrder() {
  return Object.keys(TREND_SEASONS).sort((a, b) => {
    const [sa, ya] = a.split("-"), [sb, yb] = b.split("-");
    if (ya !== yb) return Number(ya) - Number(yb);
    return sa === sb ? 0 : sa === "SS" ? -1 : 1;
  });
}

export function getTrends(now = new Date()) {
  const k = seasonKey(now);
  if (TREND_SEASONS[k]) return { key: k, live: true, ...TREND_SEASONS[k] };
  const keys = seasonOrder();
  const same = keys.filter((x) => x.startsWith(k.slice(0, 2))).pop();
  const use = same || keys[keys.length - 1];
  return { key: use, live: false, ...TREND_SEASONS[use] };
}
