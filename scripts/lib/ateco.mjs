// Filtro tessile: ATECO (preferito) o parole chiave (fallback).
import { TEXTILE_ATECO, TEXTILE_KEYWORDS } from "../config.mjs";

export const isTextileAteco = (code) => {
  const c = String(code || "").replace(/\s/g, "");
  return TEXTILE_ATECO.some((p) => c.startsWith(p) || c.startsWith(p.replace(".", "")));
};

export const isTextileText = (text) => {
  const t = String(text || "").toLowerCase();
  return TEXTILE_KEYWORDS.some((k) => t.includes(k));
};

// Un'azienda è "tessile" se ha ATECO tessile, oppure (in mancanza) se la
// descrizione/categoria contiene parole chiave del comparto.
export function isTextile(company) {
  if (company.ateco && isTextileAteco(company.ateco)) return true;
  if (company.ateco) return false; // ATECO presente ma non tessile → escludi
  return isTextileText([company.name, company.category, company.speciality, company.description].join(" "));
}
