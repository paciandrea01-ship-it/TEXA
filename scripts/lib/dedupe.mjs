// Deduplica per Partita IVA → dominio → nome normalizzato.
import { normName, domainOf, normVat } from "./normalize.mjs";

export const dedupeKey = (c) =>
  normVat(c.vat) || domainOf(c.website) || normName(c.name);

export function dedupe(companies, existing = []) {
  const seen = new Set(existing.map(dedupeKey).filter(Boolean));
  const out = [];
  for (const c of companies) {
    const k = dedupeKey(c);
    if (!k || seen.has(k)) continue;
    seen.add(k);
    out.push(c);
  }
  return out;
}
