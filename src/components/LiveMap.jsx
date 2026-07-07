import React, { useRef, useState, useEffect } from "react";
import { MAP, px, py, ITALY, SICILY, SARDINIA, toPath } from "../lib/mapGeo.js";

export function LiveMap({ companies, hoveredId, setHoveredId, onOpen }) {
  const boxRef = useRef(null);
  const mapRef = useRef(null);
  const layerRef = useRef(null);
  const markersRef = useRef({});
  const [status, setStatus] = useState("loading"); // loading | ready | failed

  useEffect(() => {
    let dead = false;
    const init = () => {
      if (dead || !boxRef.current || mapRef.current || !window.L) return;
      const L = window.L;
      const map = L.map(boxRef.current, { scrollWheelZoom: false, attributionControl: true });
      map.setView([43.4, 11.5], 5);
      L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
        attribution: "© OpenStreetMap · © CARTO", subdomains: "abcd", maxZoom: 18,
      }).addTo(map);
      layerRef.current = L.layerGroup().addTo(map);
      mapRef.current = map;
      setStatus("ready");
      setTimeout(() => map.invalidateSize(), 150);
    };
    if (window.L) { init(); return; }
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css";
    document.head.appendChild(link);
    const s = document.createElement("script");
    s.src = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js";
    s.onload = init;
    s.onerror = () => setStatus("failed");
    document.head.appendChild(s);
    const t = setTimeout(() => { if (!window.L) setStatus("failed"); }, 7000);
    return () => { dead = true; clearTimeout(t); if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; } };
  }, []);

  // markers
  useEffect(() => {
    const L = window.L;
    if (status !== "ready" || !L || !layerRef.current) return;
    layerRef.current.clearLayers();
    markersRef.current = {};
    companies.forEach((c) => {
      const icon = L.divIcon({ className: "", html: '<div class="lpin"></div>', iconSize: [14, 14], iconAnchor: [7, 7] });
      const m = L.marker([c.lat, c.lng], { icon }).addTo(layerRef.current);
      m.bindTooltip(c.name, { direction: "top", offset: [0, -8], className: "ltip" });
      m.on("click", () => onOpen(c.id));
      m.on("mouseover", () => setHoveredId(c.id));
      m.on("mouseout", () => setHoveredId(null));
      markersRef.current[c.id] = m;
    });
    if (companies.length > 0) {
      const b = L.latLngBounds(companies.map((c) => [c.lat, c.lng]));
      mapRef.current.fitBounds(b.pad(0.18), { maxZoom: 9 });
    }
  }, [status, companies]);

  // hover sync (list → map)
  useEffect(() => {
    Object.entries(markersRef.current).forEach(([id, m]) => {
      const el = m.getElement && m.getElement();
      if (!el) return;
      const dot = el.querySelector(".lpin");
      if (dot) dot.classList.toggle("on", id === hoveredId);
    });
  }, [hoveredId, status, companies]);

  if (status === "failed") return <FallbackMap companies={companies} hoveredId={hoveredId} setHoveredId={setHoveredId} onOpen={onOpen} />;
  return (
    <div className="mapwrap">
      <div ref={boxRef} className="leaflet-box" />
      {status === "loading" && <div className="map-loading">Caricamento mappa…</div>}
    </div>
  );
}

function FallbackMap({ companies, hoveredId, setHoveredId, onOpen }) {
  return (
    <div className="mapwrap">
      <svg viewBox={"0 0 " + MAP.w + " " + MAP.h} className="svgmap" role="img" aria-label={"Mappa con " + companies.length + " aziende"}>
        <path d={toPath(ITALY)} fill="#F2F3F0" stroke="#E1E3DE" strokeWidth="1.2" strokeLinejoin="round" />
        <path d={toPath(SICILY)} fill="#F2F3F0" stroke="#E1E3DE" strokeWidth="1.2" />
        <path d={toPath(SARDINIA)} fill="#F2F3F0" stroke="#E1E3DE" strokeWidth="1.2" />
        {companies.map((c) => {
          const on = hoveredId === c.id;
          return (
            <g key={c.id} className="pin" transform={"translate(" + px(c.lng).toFixed(1) + "," + py(c.lat).toFixed(1) + ")"}
              onMouseEnter={() => setHoveredId(c.id)} onMouseLeave={() => setHoveredId(null)} onClick={() => onOpen(c.id)}>
              <circle r={on ? 10 : 7} fill={on ? "var(--green)" : "rgba(20,20,20,.08)"} />
              <circle r={on ? 4.4 : 3.2} fill={on ? "#fff" : "var(--ink)"} stroke={on ? "var(--ink)" : "#fff"} strokeWidth="1.4" />
            </g>
          );
        })}
      </svg>
    </div>
  );
}
