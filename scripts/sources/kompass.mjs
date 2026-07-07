// Fonte: Kompass (directory B2B mondiale). API a contratto: KOMPASS_KEY.
// Classificazione tessile via codici Kompass (NACE 13/14).
// Doc: https://www.kompass.com / API partner.

const BASE = process.env.KOMPASS_URL || "https://api.kompass.com/v2";

export async function fetchCompanies({ nace = ["13", "14"], country = "IT", limit = 100 }) {
  const key = process.env.KOMPASS_KEY;
  if (!key) {
    throw new Error(
      "KOMPASS_KEY mancante (fonte opzionale). Configura l'API Kompass,\n" +
      "  oppure disattiva questa fonte in scripts/config.mjs (array SOURCES)."
    );
  }
  const params = new URLSearchParams({ nace: nace.join(","), country, limit: String(limit) });
  const res = await fetch(BASE + "/companies?" + params, { headers: { Authorization: "Bearer " + key } });
  if (!res.ok) throw new Error("Kompass HTTP " + res.status);
  const data = await res.json();
  return (data.data || []).map((c) => ({
    name: c.name, website: c.web, emails: c.emails || [], phone: c.phone,
    address: c.address, city: c.city, province: c.province, country: "ITALIA",
    speciality: c.activity || "", description: c.activity || "", tags: [],
    ateco: c.nace || "", vat: c.vat || "", pec: c.pec || "",
  }));
}
