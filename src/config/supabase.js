// ------------------------------------------------------------------
// Connessione a Supabase (sorgente dati dei fornitori).
// Incolla qui l'URL del progetto e la chiave ANON (pubblica: è sicura
// nel frontend, i dati sono protetti dalle policy RLS su Supabase).
// Li trovi in: Supabase → Project Settings → API.
//
// Finché restano vuoti, l'app usa il fallback locale (COMPANIES = []).
// ------------------------------------------------------------------
import { createClient } from "@supabase/supabase-js";

export const SUPABASE_URL = "https://jnnsufohcrrqqdelxick.supabase.co";
export const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpubnN1Zm9oY3JycXFkZWx4aWNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM1MTg5OTAsImV4cCI6MjA5OTA5NDk5MH0.2VWiL4HWNEln7T79aRD9yJ_y39wdcjfqo-iB3Cg6SQM";

// Nome della tabella con i fornitori
export const COMPANIES_TABLE = "companies";

export const supabase =
  SUPABASE_URL && SUPABASE_ANON_KEY ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;
export const SUPABASE_URL = "https://jnnsufohcrrqqdelxick.supabase.co/rest/v1/";
export const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpubnN1Zm9oY3JycXFkZWx4aWNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM1MTg5OTAsImV4cCI6MjA5OTA5NDk5MH0.2VWiL4HWNEln7T79aRD9yJ_y39wdcjfqo-iB3Cg6SQM";
