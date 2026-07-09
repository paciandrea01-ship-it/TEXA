// ------------------------------------------------------------------
// Connessione a Supabase (sorgente dati dei fornitori).
// URL del progetto (SENZA "/rest/v1/") e chiave ANON (pubblica: è sicura
// nel frontend, i dati sono protetti dalle policy RLS su Supabase).
// Li trovi in: Supabase → Project Settings → API.
// ------------------------------------------------------------------
import { createClient } from "@supabase/supabase-js";

export const SUPABASE_URL = "https://jnnsufohcrrqqdelxick.supabase.co";
export const SUPABASE_ANON_KEY = "sb_publishable_em6fU7Y8Jc9OIMGeK6_6xA_x4OqCoIx";

// Nome della tabella con i fornitori
export const COMPANIES_TABLE = "companies";

export const supabase =
  SUPABASE_URL && SUPABASE_ANON_KEY ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;
