#!/usr/bin/env node
// ------------------------------------------------------------------
// Carica un file (.xlsx o .csv) di fornitori nella tabella Supabase
// "companies".  Usa la SERVICE ROLE key (mai nel frontend!).
//
//   npm run import:supabase -- percorso/al/file.xlsx
//
// .env richiesto:
//   SUPABASE_URL=...            (Project Settings → API)
//   SUPABASE_SERVICE_KEY=...    (service_role key, segreta)
//
// Mappatura colonne flessibile: riconosce intestazioni comuni
// (Supplier Name, categoria, città, Email, ecc.). Adatta MAP se serve.
// ------------------------------------------------------------------
import "dotenv/config";
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import XLSX from "xlsx";
import { coordsFor } from "./lib/geo.mjs";
import { clean, isEmail } from "./lib/normalize.mjs";

const file = process.argv[2];
if (!file) { console.error("Uso: npm run import:supabase -- file.xlsx"); process.exit(1); }
const { SUPABASE_URL, SUPABASE_SERVICE_KEY } = process.env;
if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error("Mancano SUPABASE_URL e/o SUPABASE_SERVICE_KEY in .env"); process.exit(1);
}

// intestazione (minuscola) → campo tabella
const MAP = {
  "supplier name": "name", "nome": "name", "azienda": "name", "name": "name",
  "categoria 1 - p.principale": "category", "categoria": "category", "category": "category",
  "sottocategoria": "speciality", "speciality": "speciality",
  "desacrizione": "description", "descrizione": "description", "description": "description",
  "country": "country", "paese": "country",
  "città": "city", "citta": "city", "city": "city",
  "provincia": "province", "province": "province",
  "via": "address", "indirizzo": "address", "address": "address",
  "contact person": "contact_person", "referente": "contact_person",
  "website": "website", "sito": "website",
  "email": "emails", "emails": "emails",
  "numero di telefono": "phone", "telefono": "phone", "phone": "phone", "contact number": "phone",
  "vat": "vat", "partita iva": "vat", "p.iva": "vat",
  "pec": "pec", "ateco": "ateco",
};

const hash = (s) => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0).toString(16).padStart(8, "0"); };

function rows() {
  if (/\.csv$/i.test(file)) {
    const wb = XLSX.read(readFileSync(file, "utf8"), { type: "string" });
    return XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { defval: "" });
  }
  const wb = XLSX.readFile(file);
  return XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { defval: "" });
}

const records = [];
for (const raw of rows()) {
  const r = {};
  for (const [k, v] of Object.entries(raw)) {
    const field = MAP[String(k).trim().toLowerCase()];
    if (field) r[field] = v;
  }
  const name = clean(r.name);
  if (!name) continue;
  const emails = String(r.emails || "").match(/[\w.+-]+@[\w-]+\.[\w.-]+/g) || [];
  const province = clean(r.province);
  const { lat, lng } = coordsFor(name, province);
  records.push({
    id: "c" + hash(name).slice(0, 8),
    name,
    category: clean(r.category),
    speciality: clean(r.speciality),
    description: clean(r.description),
    tags: clean(r.description).split(/\s*[,;]\s*/).filter(Boolean).slice(0, 8),
    certifications: [],
    vat: clean(r.vat), ateco: clean(r.ateco),
    country: clean(r.country) || "ITALIA",
    city: clean(r.city), province, address: clean(r.address),
    contact_person: clean(r.contact_person),
    website: clean(r.website),
    emails: emails.filter(isEmail),
    pec: clean(r.pec),
    phone: clean(r.phone),
    lat, lng,
  });
}

console.log("Righe valide:", records.length);
const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, { auth: { persistSession: false } });
const { error, count } = await sb.from("companies").upsert(records, { onConflict: "id", count: "exact" });
if (error) { console.error("Errore upsert:", error.message); process.exit(1); }
console.log("Upsert completato:", count ?? records.length, "fornitori in Supabase.");
