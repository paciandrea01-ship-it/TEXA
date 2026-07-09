// Conversazioni: nessun thread demo (il database è caricato da Supabase).
// Le chat si avviano cercando un fornitore nella pagina Messaggi.
export const SEED_THREADS = [];

export const AUTO_REPLIES = [
  "Grazie del messaggio! L'ufficio commerciale vi risponde entro la giornata.",
  "Ricevuto — prepariamo cartella colori e scheda tecnica aggiornate.",
  "Perfetto, giriamo la richiesta alla produzione e torniamo con MOQ e tempi di consegna.",
];

export const autoReply = (n) => AUTO_REPLIES[n % AUTO_REPLIES.length];
