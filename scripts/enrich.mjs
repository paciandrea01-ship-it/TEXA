#!/usr/bin/env node
// ------------------------------------------------------------------
// TEXA — pipeline di arricchimento database (solo tessile, contatti
// verificati, tetto massimo 200 aziende).
//
//   node scripts/enrich.mjs               esegue e scrive companies.js
//   node scripts/enrich.mjs --dry-run     mostra il piano, non scrive
//   node scripts/enrich.mjs --max 150     sovrascrive il tetto
//
// Flusso: fonti B2B → filtro tessile (ATECO) → verifica contatti →
// dedup vs esistenti → tetto MAX → merge → src/data/companies.js
// ------------------------------------------------------------------
import "dotenv/config";
import { MAX_COMPANIES, TEXTILE_ATECO, TEXTILE_KEYWORDS, REQUIRE_CONTACT, SOURCES } from "./config.mjs";
import { isTextile } from "./lib/ateco.mjs";
import { verifyContacts } from "./lib/normalize.mjs";
import { dedupe } from "./lib/dedupe.mjs";
import { readExisting, toCompany, writeDb } from "./lib/writeDb.mjs";

import * as registroImprese from "./sources/registroImprese.mjs";
import * as europages from "./sources/europages.mjs";
import * as kompass from "./sources/kompass.mjs";
import * as searchApi from "./sources/searchApi.mjs";

const PROVIDERS = { registroImprese, europages, kompass, searchApi };

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const maxArg = args.includes("--max") ? Number(args[args.indexOf("--max") + 1]) : MAX_COMPANIES;
const MAX = Math.min(maxArg || MAX_COMPANIES, MAX_COMPANIES);

async function main() {
  const existing = readExisting();
  console.log("Database attuale:", existing.length, "aziende · tetto:", MAX);
  const room = MAX - existing.length;
  if (room <= 0) { console.log("Tetto già raggiunto: nessuna aggiunta."); return; }

  const provinces = [...new Set(existing.map((c) => c.province).filter(Boolean))];
  let harvested = [];
  for (const name of SOURCES) {
    const src = PROVIDERS[name];
    if (!src) continue;
    try {
      const batch = await src.fetchCompanies({
        atecoPrefixes: TEXTILE_ATECO, keywords: TEXTILE_KEYWORDS.slice(0, 6),
        provinces, country: "IT", limit: room * 3,
      });
      console.log("  [" + name + "] " + batch.length + " candidati");
      harvested.push(...batch);
    } catch (e) {
      console.log("  [" + name + "] saltata: " + e.message.split("\n")[0]);
    }
  }

  if (harvested.length === 0) {
    console.log(
      "\nNessun candidato raccolto: configura almeno una fonte in .env (vedi scripts/README.md).\n" +
      "La più affidabile per PEC/ATECO verificati è Registro Imprese/InfoCamere."
    );
    return;
  }

  // filtro tessile + verifica contatti
  let valid = [];
  for (const raw of harvested) {
    if (!isTextile(raw)) continue;
    const cc = verifyContacts(raw);
    const hasContact = cc.emails.length || cc.pec || cc.phone;
    if (REQUIRE_CONTACT && !hasContact) continue;
    valid.push({ ...raw, ...cc });
  }

  // dedup interno + vs esistenti, poi tetto
  const fresh = dedupe(valid, existing).slice(0, room);
  console.log("Nuove aziende tessili verificate:", fresh.length);

  const seen = new Set(existing.map((c) => c.id));
  const merged = [...existing, ...fresh.map((r) => toCompany(r, seen))];
  writeDb(merged, { dryRun });
  console.log(dryRun ? "(dry-run) totale sarebbe: " + merged.length : "Totale database: " + merged.length);
}

main().catch((e) => { console.error(e); process.exit(1); });
