# Arricchimento automatico del database (solo tessile · max 200)

Pipeline che amplia `src/data/companies.js` con **aziende del comparto
tessile** e **contatti verificati** (email, PEC, telefono), attingendo a
**fonti B2B strutturate** invece che allo scraping di Google.

## Fonti (in ordine di affidabilità)

1. **Registro Imprese / InfoCamere** — dati camerali ufficiali: Partita IVA,
   **PEC**, sede, **codice ATECO**. È la fonte migliore per contatti verificati.
2. **Europages** — directory B2B europea (categoria tessile). API partner.
3. **Kompass** — directory B2B mondiale (NACE 13/14). API a contratto.
4. **Google Programmable Search** — solo come *fallback*, via API ufficiale
   (mai scraping dei risultati, vietato dai ToS di Google).

## Come si usa

```bash
cp .env.example .env      # compila almeno una chiave (vedi sotto)
npm run enrich -- --dry-run   # mostra il piano senza scrivere
npm run enrich                # scrive src/data/companies.js
npm run enrich -- --max 150   # tetto personalizzato (max assoluto 200)
```

Le chiavi vanno in `.env` (vedi `.env.example`).

## Regole applicate (in `scripts/config.mjs`)

- **Solo tessile**: filtro per **ATECO 13/14** (industrie tessili /
  confezione) e 20.60 (fibre); in mancanza di ATECO, fallback su parole
  chiave del comparto.
- **Solo contatti verificati**: un'azienda entra solo se ha almeno un
  contatto validato (email, PEC riconosciuta, o telefono plausibile).
- **Tetto massimo 200 aziende** in totale (`MAX_COMPANIES`), per non
  appesantire il database.
- **Dedup** per Partita IVA → dominio → nome normalizzato: nessun doppione
  rispetto ai fornitori già presenti.

## Note legali e qualità

- Rispettare i **Termini di servizio** delle fonti e i `robots.txt`; usare
  le **API ufficiali**, non lo scraping.
- I contatti aziendali sono trattati nel rispetto del **GDPR** (base
  giuridica, possibilità di opt-out).
- Prevedere una **revisione umana** prima della pubblicazione dei nuovi
  record: la pipeline propone, non pubblica alla cieca.

## Perché non gira "a vuoto"

Senza chiavi, ogni fonte si disattiva con un messaggio che spiega cosa
configurare: la pipeline non inventa contatti. È pensata per essere
eseguita da un ambiente con rete aperta e le API attive.
