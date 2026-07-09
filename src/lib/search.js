// Interprete query (MVP keyword matching, firma AI-ready)
export const MATERIAL_HINTS = ["lino", "linen", "canapa", "hemp", "cotone", "cotton", "lana", "wool", "seta", "silk", "cashmere", "mohair", "alpaca", "viscosa", "nylon", "poliestere", "polipropilene", "riciclat", "recycled", "econyl", "dryarn", "lyocell", "bamboo", "grafene", "merino"];

export const CATEGORY_HINTS = [
  [["filat", "yarn", "filo "], "Filati"],
  [["tessut", "jersey", "fabric"], "Tessuti"],
  [["calze", "calzett", "hosiery", "socks"], "Calze & Calzetteria"],
  [["intimo", "underwear", "abbigliament", "leggings", "pigiam"], "Abbigliamento & Intimo"],
  [["stampa", "ricam", "serigraf", "sublimat", "print", "embroider"], "Stampa & Ricamo"],
  [["confezion", "stiro"], "Confezioni & Servizi"],
  [["scatol", "espositor", "packaging", "appendin", "etichett"], "Packaging & Display"],
  [["macchin", "machine"], "Macchinari"],
];

export function interpretQuery(q) {
  const t = q.toLowerCase();
  let category = null;
  for (const [hints, cat] of CATEGORY_HINTS) {
    if (hints.some((h) => t.includes(h))) { category = cat; break; }
  }
  const materials = MATERIAL_HINTS.filter((m) => t.includes(m));
  const keywords = t.split(/[\s,]+/).filter((w) => w.length > 2);
  return { category, materials, keywords };
}

export function searchCompanies(companies, query, activeCategory) {
  const intent = query ? interpretQuery(query) : { category: null, materials: [], keywords: [] };
  const cat = activeCategory || intent.category;
  return (companies || []).filter((c) => {
    if (cat && c.category !== cat) return false;
    if (!query) return true;
    const hay = (c.name + " " + c.speciality + " " + c.description + " " + c.tags.join(" ") + " " + c.city + " " + c.certifications.join(" ")).toLowerCase();
    const kws = intent.keywords;
    if (kws.length === 0) return true;
    return kws.some((k) => hay.includes(k)) || intent.materials.some((m) => hay.includes(m));
  });
}
