// Coordinate mappa: centroide di provincia (fallback quando un record
// Supabase non ha lat/lng).
const PROV = {
  BG: [45.69, 9.67], LE: [40.35, 18.17], BS: [45.54, 10.22], MN: [45.16, 10.79], TV: [45.67, 12.24],
  RE: [44.70, 10.63], BO: [44.49, 11.34], BT: [41.20, 16.28], CO: [45.81, 9.09], VR: [45.44, 10.99],
  PO: [43.88, 11.10], PT: [43.93, 10.91], VI: [45.55, 11.55], FI: [43.77, 11.26], BI: [45.57, 8.05],
  PV: [45.19, 9.16], PD: [45.41, 11.88], PL: [51.77, 19.46], MB: [45.58, 9.27], PR: [44.80, 10.33],
  TN: [46.07, 11.12], PC: [45.05, 9.69], MI: [45.46, 9.19], VE: [45.44, 12.32], NO: [45.45, 8.62],
  VA: [45.82, 8.83], LC: [45.86, 9.39], CR: [45.13, 10.02], BL: [46.14, 12.22], MC: [43.30, 13.45],
  AN: [43.62, 13.51], TO: [45.07, 7.69], CN: [44.39, 7.55], AR: [43.46, 11.88], PU: [43.91, 12.91],
  VC: [45.65, 8.29],
};

function hashHex(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return (h >>> 0).toString(16).padStart(8, "0");
}

export function coordsFor(name = "", province = "") {
  const base = PROV[String(province).toUpperCase()] || [43.0, 12.0];
  const j = (salt) => (parseInt(hashHex(name + salt).slice(0, 4), 16) / 65535 - 0.5) * 0.34;
  return { lat: +(base[0] + j("a")).toFixed(3), lng: +(base[1] + j("b")).toFixed(3) };
}
