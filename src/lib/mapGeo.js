// Geometria mappa (proiezione + fallback SVG Italia)
export const MAP = { latMax: 47.3, latMin: 36.4, lngMin: 6.4, lngMax: 18.8, w: 400, h: 540 };

export const px = (lng) => ((lng - MAP.lngMin) / (MAP.lngMax - MAP.lngMin)) * MAP.w;

export const py = (lat) => ((MAP.latMax - lat) / (MAP.latMax - MAP.latMin)) * MAP.h;

export const inItaly = (c) => c.lat >= MAP.latMin && c.lat <= MAP.latMax && c.lng >= MAP.lngMin && c.lng <= MAP.lngMax;

export const ITALY = [[45.9,6.8],[46.4,8.0],[46.5,9.3],[46.9,10.5],[47.0,12.2],[46.6,13.7],[45.6,13.8],[45.4,12.5],[44.8,12.4],[44.2,12.6],[43.6,13.6],[42.5,14.3],[42.0,15.0],[41.9,16.2],[41.4,16.1],[41.1,17.0],[40.5,18.0],[40.1,18.5],[39.8,18.4],[40.0,18.0],[40.3,17.4],[40.5,16.8],[39.9,16.6],[39.0,17.2],[38.9,16.6],[37.9,16.1],[38.3,15.8],[38.9,16.2],[40.0,15.6],[40.6,14.8],[41.2,13.0],[41.9,12.2],[42.4,11.2],[43.0,10.5],[43.6,10.3],[44.1,9.8],[44.4,8.9],[43.9,8.0],[43.8,7.5],[44.4,7.0],[45.1,6.7]];

export const SICILY = [[38.2,12.4],[38.3,13.4],[38.1,15.5],[37.5,15.1],[36.7,15.1],[37.1,13.3],[37.6,12.5]];

export const SARDINIA = [[41.2,9.2],[40.9,9.7],[39.2,9.6],[38.9,8.9],[38.9,8.4],[40.3,8.3],[41.0,8.2],[41.2,8.9]];

export const toPath = (pts) => "M" + pts.map(([la, lo]) => px(lo).toFixed(1) + " " + py(la).toFixed(1)).join(" L") + " Z";
