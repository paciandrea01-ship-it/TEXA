// Fonte: Registro Imprese / InfoCamere (dati camerali ufficiali).
// Fornisce Partita IVA, PEC, sede e codice ATECO → contatti VERIFICATI.
//
// Endpoint reale: API InfoCamere "Registro Imprese" (a contratto) o il
// portale open data ATECO. Serve la chiave REGISTRO_IMPRESE_KEY.
// Doc: https://www.registroimprese.it / https://developers.infocamere.it
//
// Restituisce record grezzi { name, vat, pec, phone, address, city,
// province, ateco, website } filtrabili a valle per ATECO tessile.

const BASE = process.env.REGISTRO_IMPRESE_URL || "https://api.infocamere.it/registroimprese/v1";

export async function fetchCompanies({ atecoPrefixes, country = "IT", limit = 100 }) {
  const key = process.env.REGISTRO_IMPRESE_KEY;
  if (!key) {
    throw new Error(
      "REGISTRO_IMPRESE_KEY mancante. È la fonte più affidabile per PEC/ATECO verificati.\n" +
      "  → Richiedi l'accesso su https://developers.infocamere.it e imposta la chiave in .env"
    );
  }
  const params = new URLSearchParams({
    country, ateco: atecoPrefixes.join(","), limit: String(limit), fields: "denominazione,piva,pec,telefono,indirizzo,comune,provincia,ateco,sito",
  });
  const res = await fetch(BASE + "/imprese?" + params, { headers: { Authorization: "Bearer " + key } });
  if (!res.ok) throw new Error("Registro Imprese HTTP " + res.status);
  const data = await res.json();
  return (data.results || []).map((r) => ({
    name: r.denominazione, vat: r.piva, pec: r.pec, phone: r.telefono,
    address: r.indirizzo, city: r.comune, province: r.provincia,
    ateco: r.ateco, website: r.sito, emails: [], country: "ITALIA",
    speciality: r.atecoDesc || "", description: r.atecoDesc || "", tags: [],
  }));
}
