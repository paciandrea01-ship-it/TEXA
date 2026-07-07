# TEXA — Textile Network & Marketplace

Piattaforma B2B per il tessile: ricerca fornitori interpretata, trend colori
stagionali, fiere internazionali, messaggistica e cartelle colori Pantone-style.
73 fornitori reali (Made in Italy) importati da `LISTA.xlsx`.

## Avvio

```bash
npm install
npm run dev      # server di sviluppo su http://localhost:8000
```

## Build statico

```bash
npm run build    # genera dist/ — apri dist/index.html con doppio click
```

## Struttura del progetto

```
src/
  main.jsx                 punto di ingresso (monta <App/>, importa la CSS)
  App.jsx                  stato globale + routing tra le viste
  styles/global.css        design system (bianco / nero / verde)
  config/media.js          immagini reali opzionali (gomitoli, frutta)
  assets/                  file immagine del progetto
  data/                    dati puri
    companies.js           73 fornitori (generato da LISTA.xlsx)
    catalog.js             categorie, palette index, certificazioni, marquee
    fairs.js               fiere + stato calcolato sulla data corrente
    trends.js              trend colori stagionali (hook useTrends)
    shades.js              cartelle colori per azienda
    consultants.js         advisor della piattaforma
    threads.js             conversazioni demo
  lib/                     logica pura
    search.js              interprete query (AI-ready) + filtro
    products.js            prodotti mock + swatch
    mapGeo.js              proiezione mappa + fallback SVG Italia
    docs.js                documenti scaricabili
  components/              un componente per file
    Header.jsx  Marquee.jsx  GreenStrip.jsx  YarnArt.jsx
    FruitBackground.jsx  Consultants.jsx  Home.jsx  SearchPage.jsx
    Results.jsx  LiveMap.jsx  CompanyPage.jsx  RfqModal.jsx
    TrendColors.jsx  FairsPage.jsx  MessagesPage.jsx
    ui/Badge.jsx  ui/Palette.jsx
```

## Immagini reali

Le foto (gomitoli, agrumi) sono opzionali: vedi `src/assets/README.md`.
Senza foto, l'app usa fallback SVG già pronti.
