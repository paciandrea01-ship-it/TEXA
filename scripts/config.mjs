// Configurazione della pipeline di arricchimento database TEXA.
// Solo tessile, contatti verificati, tetto massimo di aziende.

export const MAX_COMPANIES = 200;          // tetto totale del database (richiesta utente)
export const COUNTRY = "IT";               // ambito: Italia
export const REQUIRE_CONTACT = true;       // includi solo aziende con almeno un contatto verificato

// Codici ATECO del comparto tessile/abbigliamento (prefissi).
// 13 = industrie tessili · 14 = confezione articoli di abbigliamento
// 20.60 = fibre sintetiche/artificiali (filati tecnici)
export const TEXTILE_ATECO = [
  "13.10", "13.20", "13.30", "13.91", "13.92", "13.93", "13.94", "13.95", "13.96", "13.99",
  "14.11", "14.12", "14.13", "14.14", "14.19", "14.20", "14.31", "14.39",
  "20.60",
];

// Parole chiave tessili (fallback quando l'ATECO non è disponibile dalla fonte)
export const TEXTILE_KEYWORDS = [
  "filat", "filatura", "tessut", "tessitura", "maglier", "calzific", "calze",
  "filo", "yarn", "fabric", "knit", "tessile", "cotone", "lana", "lino",
  "cashmere", "mohair", "seta", "nylon", "poliestere", "confezion", "ricamo",
  "stamperia", "tintoria", "nobilitazione", "orditura", "torcitura",
];

// Fonti attive (in ordine di priorità). Ognuna richiede la propria chiave/endpoint.
export const SOURCES = ["registroImprese", "europages", "kompass", "searchApi"];
