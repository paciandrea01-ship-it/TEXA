import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { supabase, COMPANIES_TABLE } from "../config/supabase.js";
import { coordsFor } from "../lib/geo.js";

// Normalizza gli array che Supabase può restituire come jsonb, array
// Postgres o stringa separata da virgole.
const arr = (v) => {
  if (Array.isArray(v)) return v.filter(Boolean);
  if (v == null || v === "") return [];
  if (typeof v === "string") {
    const s = v.trim();
    if (s.startsWith("[")) { try { return JSON.parse(s); } catch { /* ignore */ } }
    if (s.startsWith("{") && s.endsWith("}")) return s.slice(1, -1).split(",").map((x) => x.replace(/^"|"$/g, "")).filter(Boolean);
    return s.split(",").map((x) => x.trim()).filter(Boolean);
  }
  return [];
};

// Certificazioni note, estratte dal testo della descrizione quando la
// tabella non ha una colonna dedicata.
const KNOWN_CERTS = ["GOTS", "GRS", "RWS", "RMS", "OEKO-TEX", "ISO 9001", "BCI"];
const certsFromText = (t) => KNOWN_CERTS.filter((c) => (t || "").toUpperCase().includes(c));

// Riga Supabase → oggetto Company usato dall'app. Accetta sia i nomi
// colonna "storici" (name, category, city…) sia quelli del CSV
// fornitori (supplier_name, categoria, citta, sigla…), così la tabella
// si può importare in Supabase direttamente dal file, senza rinominare.
function mapRow(r) {
  const name = r.name || r.supplier_name || "";
  const province = r.province || r.sigla || "";
  const description = r.description || r.descrizione || "";
  const hasCoords = r.lat != null && r.lng != null;
  const { lat, lng } = hasCoords ? { lat: Number(r.lat), lng: Number(r.lng) } : coordsFor(name, province);
  return {
    id: r.id != null ? String(r.id) : "c" + Math.random().toString(36).slice(2, 10),
    name,
    category: r.category || r.categoria || "",
    speciality: r.speciality || r.sottocategoria || r.speciality_originale || "",
    description,
    tags: arr(r.tags).length > 0 ? arr(r.tags) : description.split(",").map((x) => x.trim()).filter(Boolean).slice(0, 8),
    certifications: arr(r.certifications).length > 0 ? arr(r.certifications) : certsFromText(description),
    vat: r.vat || r.piva || "",
    ateco: r.ateco || "",
    country: r.country || r.paese || "ITALIA",
    city: r.city || r.citta || "",
    province,
    address: r.address || r.indirizzo || "",
    contactPerson: r.contactPerson || r.contact_person || r.referente || "",
    website: r.website || r.sito || "",
    emails: arr(r.emails).length > 0 ? arr(r.emails) : arr(r.email),
    pec: r.pec || "",
    phone: r.phone || r.telefono || "",
    lat, lng,
  };
}

// Unica sorgente dati: il database Supabase. Nessun dato locale o mock.
const Ctx = createContext({ companies: [], loading: true, error: null });

export function CompaniesProvider({ children }) {
  const [state, setState] = useState({ companies: [], loading: !!supabase, error: supabase ? null : "Supabase non configurato." });

  useEffect(() => {
    if (!supabase) return;
    let dead = false;
    supabase.from(COMPANIES_TABLE).select("*").then(({ data, error }) => {
      if (dead) return;
      if (error) { setState({ companies: [], loading: false, error: error.message }); return; }
      setState({ companies: (data || []).map(mapRow), loading: false, error: null });
    });
    return () => { dead = true; };
  }, []);

  return <Ctx.Provider value={state}>{children}</Ctx.Provider>;
}

export const useCompanies = () => useContext(Ctx).companies;
export const useCompaniesState = () => useContext(Ctx);

// Categorie reali presenti nel database (ordinate per numerosità):
// i riquadri e i filtri si adattano a qualunque categoria usata su Supabase.
export function useCategories() {
  const companies = useCompanies();
  return useMemo(() => {
    const n = {};
    companies.forEach((c) => { if (c.category) n[c.category] = (n[c.category] || 0) + 1; });
    return Object.keys(n).sort((a, b) => n[b] - n[a]);
  }, [companies]);
}
