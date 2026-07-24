// Coordinate mappa: fallback quando un record Supabase non ha lat/lng.
// Tiene conto del PAESE, non solo della provincia italiana, così le
// aziende estere (Cina, Turchia, ecc.) non finiscono in Italia.

// Province italiane → centroide
const PROV = {
  BG: [45.69, 9.67], LE: [40.35, 18.17], BS: [45.54, 10.22], MN: [45.16, 10.79], TV: [45.67, 12.24],
  RE: [44.70, 10.63], BO: [44.49, 11.34], BT: [41.20, 16.28], CO: [45.81, 9.09], VR: [45.44, 10.99],
  PO: [43.88, 11.10], PT: [43.93, 10.91], VI: [45.55, 11.55], FI: [43.77, 11.26], BI: [45.57, 8.05],
  PV: [45.19, 9.16], PD: [45.41, 11.88], MB: [45.58, 9.27], PR: [44.80, 10.33],
  TN: [46.07, 11.12], PC: [45.05, 9.69], MI: [45.46, 9.19], VE: [45.44, 12.32], NO: [45.45, 8.62],
  VA: [45.82, 8.83], LC: [45.86, 9.39], CR: [45.13, 10.02], BL: [46.14, 12.22], MC: [43.30, 13.45],
  AN: [43.62, 13.51], TO: [45.07, 7.69], CN: [44.39, 7.55], AR: [43.46, 11.88], PU: [43.91, 12.91],
  VC: [45.65, 8.29],
};

// Paesi → centroide nazionale (nome minuscolo, senza accenti particolari)
const COUNTRY = {
  "italia": [43.0, 12.0], "italy": [43.0, 12.0],
  "cina": [34.5, 108.0], "china": [34.5, 108.0],
  "turchia": [39.0, 35.2], "turkey": [39.0, 35.2],
  "germania": [51.1, 10.4], "germany": [51.1, 10.4],
  "spagna": [40.2, -3.7], "spain": [40.2, -3.7],
  "francia": [46.6, 2.4], "france": [46.6, 2.4],
  "india": [22.5, 78.9],
  "bangladesh": [23.7, 90.4],
  "svizzera": [46.8, 8.2], "switzerland": [46.8, 8.2],
  "egitto": [26.8, 30.8], "egypt": [26.8, 30.8],
  "giappone": [36.2, 138.3], "japan": [36.2, 138.3],
  "usa": [39.0, -98.0], "stati uniti": [39.0, -98.0], "united states": [39.0, -98.0],
  "paesi bassi": [52.1, 5.3], "olanda": [52.1, 5.3], "netherlands": [52.1, 5.3],
  "polonia": [52.0, 19.1], "poland": [52.0, 19.1],
  "austria": [47.6, 14.1],
  "australia": [-25.3, 133.8],
  "uk": [53.0, -1.5], "regno unito": [53.0, -1.5], "united kingdom": [53.0, -1.5],
};

// Regioni cinesi → centroide (per una collocazione più precisa)
const CHINA = {
  "zhejiang": [29.1, 120.1], "jiangsu": [33.0, 119.8], "shanghai": [31.2, 121.5],
  "fujian": [26.1, 117.9], "guangdong": [23.3, 113.4], "shandong": [36.4, 118.5],
  "jilin": [43.7, 126.2], "hubei": [30.9, 112.3], "anhui": [31.8, 117.2],
};

// Città turche → centroide (la maggior parte dei record turchi)
const TURKEY = {
  "istanbul": [41.0, 28.98], "bursa": [40.19, 29.06], "ankara": [39.93, 32.85],
  "gaziantep": [37.07, 37.38], "tekirdağ": [40.98, 27.51], "tekirdag": [40.98, 27.51],
  "kayseri": [38.73, 35.48], "adana": [37.0, 35.32], "yalova": [40.65, 29.28],
  "hatay": [36.4, 36.16], "şanlıurfa": [37.17, 38.79], "sanliurfa": [37.17, 38.79],
  "kahramanmaraş": [37.58, 36.93], "kahramanmaras": [37.58, 36.93],
  "izmir": [38.42, 27.14],
};

function hashHex(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return (h >>> 0).toString(16).padStart(8, "0");
}

const norm = (s) => String(s || "").trim().toLowerCase();

// name: usato solo per lo scostamento pseudo-casuale (evita pin sovrapposti)
// loc: { province, country, region, city }
export function coordsFor(name = "", loc = {}) {
  // retrocompatibilità: coordsFor(name, "BS")
  const l = typeof loc === "string" ? { province: loc } : (loc || {});
  const country = norm(l.country);
  const isItaly = !country || country === "italia" || country === "italy";

  let base;
  if (isItaly) {
    base = PROV[String(l.province || "").toUpperCase()] || COUNTRY["italia"];
  } else if (country === "cina" || country === "china") {
    base = CHINA[norm(l.region)] || COUNTRY["cina"];
  } else if (country === "turchia" || country === "turkey") {
    base = TURKEY[norm(l.city)] || TURKEY[norm(l.region)] || COUNTRY["turchia"];
  } else {
    base = COUNTRY[country] || [30.0, 20.0]; // paese sconosciuto: comunque fuori dall'Italia
  }

  const spread = isItaly ? 0.34 : 1.2;
  const j = (salt) => (parseInt(hashHex(name + salt).slice(0, 4), 16) / 65535 - 0.5) * spread;
  return { lat: +(base[0] + j("a")).toFixed(3), lng: +(base[1] + j("b")).toFixed(3) };
}
