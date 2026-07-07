// Scrive src/data/companies.js nel formato dell'app, con tetto massimo.
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { coordsFor, hashHex } from "./geo.mjs";
import { clean } from "./normalize.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const DB_PATH = join(HERE, "..", "..", "src", "data", "companies.js");

// Porta un record grezzo verificato nello schema Company dell'app
export function toCompany(raw, seen) {
  const name = clean(raw.name);
  const province = clean(raw.province);
  const { lat, lng } = coordsFor(name, province);
  let id = "c" + hashHex(name).slice(0, 8);
  while (seen && seen.has(id)) id += "x";
  if (seen) seen.add(id);
  return {
    id, name,
    category: clean(raw.category) || "Filati",
    speciality: clean(raw.speciality),
    description: clean(raw.description),
    tags: (raw.tags || []).map(clean).filter(Boolean).slice(0, 8),
    certifications: raw.certifications || [],
    vat: raw.vat || "",
    ateco: raw.ateco || "",
    country: clean(raw.country) || "ITALIA",
    city: clean(raw.city), province, address: clean(raw.address),
    contactPerson: clean(raw.contactPerson),
    website: clean(raw.website),
    emails: raw.emails || [],
    pec: raw.pec || "",
    phone: clean(raw.phone),
    lat, lng,
  };
}

export function serialize(companies) {
  return "// TEXA — database fornitori (" + companies.length + " aziende, tessile, contatti verificati)\n" +
    "export const COMPANIES = " + JSON.stringify(companies, null, 0).replace(/},{/g, "},\n{") + ";\n";
}

export function writeDb(companies, { dryRun = false } = {}) {
  const out = serialize(companies);
  if (dryRun) { console.log("[dry-run] scriverei", companies.length, "aziende in", DB_PATH); return; }
  writeFileSync(DB_PATH, out);
  console.log("Scritte", companies.length, "aziende in src/data/companies.js");
}

export function readExisting() {
  try {
    const txt = readFileSync(DB_PATH, "utf8");
    const m = txt.match(/export const COMPANIES = (\[[\s\S]*\]);/);
    return m ? JSON.parse(m[1]) : [];
  } catch { return []; }
}
