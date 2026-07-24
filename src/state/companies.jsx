import React, { createContext, useContext, useEffect, useState } from "react";
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

// Riga Supabase → oggetto Company usato dall'app (snake_case → camelCase)
function mapRow(r) {
  const name = r.name || "";
  const province = r.province || "";
  const hasCoords = r.lat != null && r.lng != null;
  const { lat, lng } = hasCoords ? { lat: Number(r.lat), lng: Number(r.lng) } : coordsFor(name, province);
  return {
    id: r.id != null ? String(r.id) : "c" + Math.random().toString(36).slice(2, 10),
    name,
    category: r.category || "",
    speciality: r.speciality || "",
    description: r.description || "",
    tags: arr(r.tags),
    certifications: arr(r.certifications),
    vat: r.vat || "",
    ateco: r.ateco || "",
    country: r.country || "ITALIA",
    city: r.city || "",
    province,
    address: r.address || "",
    contactPerson: r.contactPerson || r.contact_person || "",
    website: r.website || "",
    emails: arr(r.emails),
    pec: r.pec || "",
    phone: r.phone || "",
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
