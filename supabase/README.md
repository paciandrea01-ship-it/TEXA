# Collegare TEXA a Supabase

Il database dei fornitori è **vuoto**: i dati arrivano da Supabase.
Tre passi.

## 1. Crea il progetto e la tabella
1. Vai su https://supabase.com → **New project** (piano free ok).
2. Apri **SQL Editor**, incolla il contenuto di `supabase/schema.sql`, **Run**.
   Crea la tabella `companies` con lettura pubblica (RLS).

## 2. Collega il frontend
In **Project Settings → API** copia:
- **Project URL**
- chiave **anon public**

Incollale in `src/config/supabase.js`:
```js
export const SUPABASE_URL = "https://xxxx.supabase.co";
export const SUPABASE_ANON_KEY = "eyJhbGci...";
```
Poi `npm run build` (o `npm run dev`). L'app leggerà i fornitori da Supabase.

## 3. Carica i tuoi dati ("quello giusto")
Due modi:

**A) Dall'interfaccia Supabase (senza codice)**
Table Editor → tabella `companies` → **Insert → Import data from CSV**.
Le colonne del CSV devono corrispondere ai campi della tabella
(`name, category, city, province, emails, phone, ...`).
`emails`/`tags`/`certifications` sono liste JSON, es. `["info@x.it"]`.

**B) Con lo script (da un Excel/CSV qualsiasi)**
```bash
# in .env aggiungi la service key (segreta):
#   SUPABASE_URL=...
#   SUPABASE_SERVICE_KEY=...   (Project Settings → API → service_role)
npm run import:supabase -- percorso/al/tuo_elenco.xlsx
```
Lo script riconosce intestazioni comuni (Supplier Name, categoria, città,
Email, telefono, …), normalizza i contatti, calcola le coordinate dalla
provincia e fa l'upsert nella tabella.

## Note
- La chiave **anon** nel frontend è sicura: la scrittura è protetta da RLS.
- La chiave **service_role** è segreta: solo lato server / nello script, mai
  nel bundle. Sta in `.env` (già in `.gitignore`).
- Se `src/config/supabase.js` resta vuoto, l'app funziona comunque a vuoto
  con il fallback locale.
