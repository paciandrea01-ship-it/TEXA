// ------------------------------------------------------------------
// Connessione a Supabase (sorgente dati dei fornitori).
// Incolla qui l'URL del progetto e la chiave ANON (pubblica: è sicura
// nel frontend, i dati sono protetti dalle policy RLS su Supabase).
// Li trovi in: Supabase → Project Settings → API.
//
// Finché restano vuoti, l'app usa il fallback locale (COMPANIES = []).
// ------------------------------------------------------------------
import { createClient } from "@supabase/supabase-js";

export const SUPABASE_URL = "";       // es. "https://xxxxxxxx.supabase.co"
export const SUPABASE_ANON_KEY = "";  // es. "eyJhbGciOi..."

// Nome della tabella con i fornitori
export const COMPANIES_TABLE = "companies";

export const supabase =
  SUPABASE_URL && SUPABASE_ANON_KEY ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;
https://jnnsufohcrrqqdelxick.supabase.co/rest/v1/
