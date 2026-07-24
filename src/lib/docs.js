import { CERT_LABELS } from "../data/catalog.js";

// Documenti scaricabili, generati dai dati reali del fornitore
// registrati su TEXA (nessun contenuto inventato).
export const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export function docsFor(c) {
  const stamp = new Date().toLocaleDateString("it-IT");
  const docs = [{
    id: "profile", label: "Profilo aziendale", type: "TXT", file: slug(c.name) + "_profilo.txt",
    make: () => [
      "TEXA — PROFILO AZIENDALE", "",
      c.name,
      (c.address ? c.address + " — " : "") + c.city + " " + (c.province || "") + " · " + c.country,
      "Categoria: " + c.category,
      c.speciality ? "Specialità: " + c.speciality : "",
      c.description ? "Descrizione: " + c.description : "",
      c.website ? "Sito: " + c.website : "",
      c.emails.length > 0 ? "Email: " + c.emails.join(", ") : "",
      c.phone ? "Telefono: " + c.phone : "",
      "Certificazioni dichiarate: " + (c.certifications.join(", ") || "—"),
      "", "Esportato da TEXA il " + stamp + " — dati registrati nel database TEXA.",
    ].filter(Boolean).join("\n"),
  }];
  c.certifications.forEach((cert) => docs.push({
    id: cert, label: "Scheda " + cert, type: "TXT", file: slug(c.name) + "_" + slug(cert) + ".txt",
    make: () => [
      "TEXA — SCHEDA CERTIFICAZIONE", "",
      "Azienda: " + c.name,
      "Standard: " + cert + (CERT_LABELS[cert] ? " — " + CERT_LABELS[cert] : ""),
      "Stato: dichiarata dal fornitore nel database TEXA",
      "", "Esportato da TEXA il " + stamp + ".",
      "Richiedi al fornitore il certificato ufficiale con numero di licenza.",
    ].join("\n"),
  }));
  return docs;
}

export function download(name, text) {
  const url = URL.createObjectURL(new Blob([text], { type: "text/plain;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url; a.download = name; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 500);
}
