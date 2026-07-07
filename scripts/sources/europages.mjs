// Fonte: Europages (directory B2B europea, comparto tessile).
// Endpoint API partner: EUROPAGES_KEY. Senza contratto API, l'accesso
// via scraping è soggetto ai Termini di servizio del sito: NON abilitato
// di default. Preferire l'API partner o l'export dati concordato.
// Doc: https://www.europages.it (sezione "Tessili e abbigliamento")

const BASE = process.env.EUROPAGES_URL || "https://api.europages.com/v1";

export async function fetchCompanies({ keywords = ["tessile", "filati"], country = "IT", limit = 100 }) {
  const key = process.env.EUROPAGES_KEY;
  if (!key) {
    throw new Error(
      "EUROPAGES_KEY mancante (fonte opzionale). Configura l'API partner Europages,\n" +
      "  oppure disattiva questa fonte in scripts/config.mjs (array SOURCES)."
    );
  }
  const params = new URLSearchParams({ q: keywords.join(" "), country, category: "textile", limit: String(limit) });
  const res = await fetch(BASE + "/companies?" + params, { headers: { "X-Api-Key": key } });
  if (!res.ok) throw new Error("Europages HTTP " + res.status);
  const data = await res.json();
  return (data.companies || []).map((c) => ({
    name: c.name, website: c.website, emails: c.email ? [c.email] : [], phone: c.phone,
    address: c.address, city: c.city, province: c.province, country: "ITALIA",
    speciality: c.activity || "", description: c.description || "", tags: c.keywords || [],
    ateco: c.nace || "", vat: c.vat || "", pec: "",
  }));
}
