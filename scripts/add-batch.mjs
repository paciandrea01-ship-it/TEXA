#!/usr/bin/env node
// Aggiunge un lotto curato di aziende tessili (senza requisito di contatto),
// deduplicato vs il database esistente e nel rispetto del tetto massimo.
//   node scripts/add-batch.mjs [--dry-run]
import { MAX_COMPANIES } from "./config.mjs";
import { dedupe } from "./lib/dedupe.mjs";
import { readExisting, toCompany, writeDb } from "./lib/writeDb.mjs";
import { BATCH } from "./data/textile-batch.mjs";

const dryRun = process.argv.includes("--dry-run");
const existing = readExisting();
const room = MAX_COMPANIES - existing.length;
console.log("Database attuale:", existing.length, "· tetto:", MAX_COMPANIES, "· spazio:", room);
if (room <= 0) { console.log("Tetto raggiunto: nessuna aggiunta."); process.exit(0); }

const fresh = dedupe(BATCH, existing).slice(0, room);
console.log("Lotto:", BATCH.length, "→ nuove dopo dedup:", fresh.length);
console.log("Aggiunte:", fresh.map((c) => c.name).join(", "));

const seen = new Set(existing.map((c) => c.id));
const merged = [...existing, ...fresh.map((r) => toCompany(r, seen))];
writeDb(merged, { dryRun });
console.log("Totale:", merged.length);
