import { useState, useEffect } from "react";

// Trend colori — stagione calcolata sulla data corrente
export const TRENDS_ENDPOINT = null;

export function seasonKey(d = new Date()) {
  const m = d.getMonth(), y = d.getFullYear();
  if (m >= 2 && m <= 7) return "SS-" + y;           // mar–ago → Primavera/Estate
  return "FW-" + (m <= 1 ? y - 1 : y);              // set–feb → Autunno/Inverno
}

export const TREND_SEASONS = {
  "SS-2026": {
    label: "Primavera / Estate 2026",
    hero: {
      name: "Cloud Dancer", pantone: "11-4201", hex: "#F0EEE4",
      note: "Pantone Color of the Year 2026: un bianco morbido e luminoso, simbolo di leggerezza, calma e nuovo minimalismo. Perfetto su tailoring pulito, lini e cotoni.",
    },
    colors: [
      { name: "Marina", pantone: "17-4041", hex: "#4F84C4", freq: 82 },
      { name: "Tickled Pink", pantone: "12-2803", hex: "#F5B0C2", freq: 74 },
      { name: "Butter Yellow", pantone: "11-0710", hex: "#F3E3A9", freq: 69 },
      { name: "Acacia", pantone: "13-0640", hex: "#DCC94C", freq: 61 },
      { name: "Aqua", pantone: "12-4610", hex: "#9BD4D8", freq: 55 },
      { name: "Apricot Crush", pantone: "16-1435", hex: "#EF8E63", freq: 48 },
      { name: "Mocha Mousse", pantone: "17-1230", hex: "#A47864", freq: 40 },
    ],
    sources: "Pantone Fashion Color Trend Report (NYFW SS26) · Vogue · WWD · Elle",
  },
  "FW-2026": {
    label: "Autunno / Inverno 2026-27",
    hero: {
      name: "Chicory Coffee", pantone: "19-1419", hex: "#53352E",
      note: "Il marrone profondo guida la stagione fredda: caldo e materico, valorizza lane, cashmere e superfici spazzolate.",
    },
    colors: [
      { name: "Tawny Port", pantone: "19-1725", hex: "#64313E", freq: 84 },
      { name: "Deep Forest", pantone: "19-6110", hex: "#35463D", freq: 76 },
      { name: "Butter Yellow", pantone: "11-0710", hex: "#F3E3A9", freq: 64 },
      { name: "Sharkskin", pantone: "17-3914", hex: "#838487", freq: 58 },
      { name: "French Blue", pantone: "18-4140", hex: "#3E6FB0", freq: 51 },
      { name: "Winter White", pantone: "11-0507", hex: "#F2EFE4", freq: 46 },
      { name: "Chili Pepper", pantone: "19-1557", hex: "#9B1B30", freq: 41 },
    ],
    sources: "Pantone Fashion Color Trend Report · Vogue · WWD · Elle",
  },
};

export function getTrends(now = new Date()) {
  const k = seasonKey(now);
  if (TREND_SEASONS[k]) return { key: k, live: true, ...TREND_SEASONS[k] };
  const keys = Object.keys(TREND_SEASONS).sort();
  const same = keys.filter((x) => x.startsWith(k.slice(0, 2))).pop();
  const use = same || keys[keys.length - 1];
  return { key: use, live: false, ...TREND_SEASONS[use] };
}

export function useTrends() {
  const [data, setData] = useState(() => getTrends());
  useEffect(() => {
    if (!TRENDS_ENDPOINT) return;
    let dead = false;
    fetch(TRENDS_ENDPOINT + "?season=" + seasonKey())
      .then((r) => r.json())
      .then((j) => { if (!dead && j && j.colors) setData((d) => ({ ...d, ...j, live: true })); })
      .catch(() => {});
    return () => { dead = true; };
  }, []);
  return data;
}
