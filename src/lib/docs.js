import { CERT_LABELS } from "../data/catalog.js";

// Documenti scaricabili + helper download
export const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export function docsFor(c) {
  const stamp = new Date().toLocaleDateString("it-IT");
  const docs = [{
    id: "profile", label: "Profilo aziendale", type: "TXT", file: slug(c.name) + "_profilo.txt",
    make: () => [
      "TEXA — PROFILO AZIENDALE (documento dimostrativo)", "",
      c.name,
      (c.address ? c.address + " — " : "") + c.city + " " + (c.province || "") + " · " + c.country,
      "Categoria: " + c.category,
      "Specialità: " + c.speciality,
      "Descrizione: " + c.description,
      c.website ? "Sito: " + c.website : "",
      "Certificazioni: " + (c.certifications.join(", ") || "—"),
      "", "Generato da TEXA il " + stamp,
    ].filter(Boolean).join("\n"),
  }];
  c.certifications.forEach((cert) => docs.push({
    id: cert, label: "Certificato " + cert, type: "TXT", file: slug(c.name) + "_" + slug(cert) + ".txt",
    make: () => [
      "TEXA — ATTESTAZIONE CERTIFICAZIONE (documento dimostrativo)", "",
      "Azienda: " + c.name,
      "Standard: " + cert + (CERT_LABELS[cert] ? " — " + CERT_LABELS[cert] : ""),
      "Stato: dichiarata dal fornitore",
      "", "Documento dimostrativo generato da TEXA il " + stamp + ".",
      "Richiedi in chat il certificato ufficiale con numero di licenza.",
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
