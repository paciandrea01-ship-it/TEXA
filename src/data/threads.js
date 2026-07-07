import { COMPANIES } from "./companies.js";

// Conversazioni demo: i fornitori sono risolti per nome, così restano
// valide anche se il database viene rigenerato (gli id cambiano).
const byName = (needle) => {
  const n = needle.toLowerCase();
  const c = COMPANIES.find((x) => x.name.toLowerCase().includes(n));
  return c ? c.id : COMPANIES[0].id;
};

export const SEED_THREADS = [
  { companyId: byName("penn solutions"), msgs: [ // tessuti GRS
    { id: "t1a", from: "sup", text: "Buongiorno! Grazie per l'interesse nei nostri tessuti tecnici GRS. Ci raccontate il progetto?", at: "09:12" },
    { id: "t1b", from: "me", text: "Buongiorno, cerchiamo un tessuto grip riciclato per una capsule di leggings sportivi. MOQ e tempi?", at: "09:30" },
    { id: "t1c", from: "sup", text: "Perfetto: per il grip GRS partiamo da 300 mt per colore, consegna 4-5 settimane. Vi inviamo cartella colori e scheda tecnica.", at: "09:41" },
  ] },
  { companyId: byName("filmar"), msgs: [ // filati cotonieri
    { id: "t2a", from: "me", text: "Salve, che disponibilità avete di Filoscozia tinto filo per la SS27?", at: "Ieri" },
    { id: "t2b", from: "sup", text: "Buongiorno! Collezione SS27 disponibile a campionario. Su quali tonalità state lavorando?", at: "Ieri" },
  ] },
  { companyId: byName("ilaria manifatture"), msgs: [ // mohair RMS
    { id: "t3a", from: "me", text: "Buongiorno, cerchiamo un mohair certificato RMS per maglieria FW26.", at: "Lun" },
    { id: "t3b", from: "sup", text: "Abbiamo un mohair RMS in 18 colori di cartella. Vi mandiamo le cartelle e i certificati aggiornati.", at: "Lun" },
  ] },
];

export const AUTO_REPLIES = [
  "Grazie del messaggio! L'ufficio commerciale vi risponde entro la giornata.",
  "Ricevuto — prepariamo cartella colori e scheda tecnica aggiornate.",
  "Perfetto, giriamo la richiesta alla produzione e torniamo con MOQ e tempi di consegna.",
];

export const autoReply = (n) => AUTO_REPLIES[n % AUTO_REPLIES.length];
