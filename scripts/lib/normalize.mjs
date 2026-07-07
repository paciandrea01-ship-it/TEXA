// Normalizzazione e validazione dei campi (contatti verificati).

export const clean = (s) => String(s == null ? "" : s).replace(/\s+/g, " ").trim();

const EMAIL_RE = /^[\w.+-]+@[\w-]+\.[\w.-]+$/;
export const isEmail = (e) => EMAIL_RE.test(String(e || "").trim());

// Euristica PEC italiana: provider certificati noti o dominio "pec."
const PEC_HINTS = ["pec.", "legalmail", "cert.", "postecert", "sicurezzapostale",
  "pec-", "arubapec", "@pec", "@cert", "ticertifica", "telecompost"];
export const isPEC = (e) => {
  const s = String(e || "").toLowerCase();
  return isEmail(s) && PEC_HINTS.some((h) => s.includes(h));
};

// Telefono: mantiene + e cifre; scarta numeri troppo corti
export const normPhone = (p) => {
  const s = clean(p).replace(/[^\d+ ]/g, "").trim();
  const digits = s.replace(/\D/g, "");
  return digits.length >= 6 ? s : "";
};

// Partita IVA italiana: 11 cifre
export const normVat = (v) => {
  const d = String(v || "").replace(/\D/g, "");
  return d.length === 11 ? d : "";
};

// Dominio da URL/sito
export const domainOf = (url) => {
  const m = String(url || "").match(/^(?:https?:\/\/)?(?:www\.)?([^/\s]+)/i);
  return m ? m[1].toLowerCase() : "";
};

// Nome normalizzato per dedup (rimuove forme societarie)
export const normName = (name) =>
  clean(name).toLowerCase()
    .replace(/\b(s\.?p\.?a|s\.?r\.?l|s\.?n\.?c|s\.?a\.?s|spa|srl|snc|sas|ltd|gmbh|& figli|group|italia)\b/g, "")
    .replace(/[^a-z0-9]+/g, " ").trim();

// Estrae i contatti verificati da un record grezzo
export function verifyContacts(raw) {
  const emails = (raw.emails || []).map((e) => clean(e).toLowerCase()).filter(isEmail);
  const pec = clean(raw.pec).toLowerCase();
  return {
    emails: [...new Set(emails)],
    pec: isPEC(pec) ? pec : (emails.find(isPEC) || ""),
    phone: normPhone(raw.phone),
    vat: normVat(raw.vat),
  };
}
