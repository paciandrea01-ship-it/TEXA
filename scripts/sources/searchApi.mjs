// Fonte di fallback: Google Programmable Search (JSON API) o SerpAPI.
// NON fa scraping dei risultati di Google (vietato dai ToS): usa l'API
// ufficiale. Serve GOOGLE_API_KEY + GOOGLE_CSE_ID (oppure SERPAPI_KEY).
//
// Uso: reperisce URL candidati di aziende tessili; l'estrazione dei
// contatti dalle pagine è demandata a un passo separato (con rispetto di
// robots.txt). Qui restituiamo i candidati con eventuali dati da snippet.

async function googleCSE(query, num = 10) {
  const key = process.env.GOOGLE_API_KEY, cx = process.env.GOOGLE_CSE_ID;
  if (!key || !cx) return null;
  const url = "https://www.googleapis.com/customsearch/v1?key=" + key + "&cx=" + cx +
    "&num=" + num + "&q=" + encodeURIComponent(query);
  const res = await fetch(url);
  if (!res.ok) throw new Error("Google CSE HTTP " + res.status);
  const data = await res.json();
  return (data.items || []).map((it) => ({ title: it.title, url: it.link, snippet: it.snippet }));
}

export async function fetchCompanies({ keywords = ["filatura tessile"], provinces = [""], limit = 100 }) {
  if (!process.env.GOOGLE_API_KEY && !process.env.SERPAPI_KEY) {
    throw new Error(
      "GOOGLE_API_KEY+GOOGLE_CSE_ID (o SERPAPI_KEY) mancanti (fonte fallback).\n" +
      "  → Crea un Programmable Search Engine su https://programmablesearchengine.google.com"
    );
  }
  const out = [];
  for (const kw of keywords) {
    for (const prov of provinces) {
      if (out.length >= limit) break;
      const q = kw + " " + prov + " azienda tessile contatti PEC";
      const items = (await googleCSE(q)) || [];
      for (const it of items) {
        out.push({
          name: it.title.replace(/[|\-–].*$/, "").trim(),
          website: it.url, description: it.snippet || "", speciality: kw,
          emails: (it.snippet.match(/[\w.+-]+@[\w-]+\.[\w.-]+/g) || []),
          phone: (it.snippet.match(/(?:\+39\s?)?0\d[\d .\-]{6,}/) || [""])[0],
          province: prov, city: "", country: "ITALIA", tags: [], ateco: "", vat: "", pec: "",
        });
      }
    }
  }
  return out.slice(0, limit);
}
