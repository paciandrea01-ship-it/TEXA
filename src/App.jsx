import React, { useState, useEffect, useMemo } from "react";
import { searchCompanies, interpretQuery } from "./lib/search.js";
import { useCompanies, useCompaniesState } from "./state/companies.jsx";
import { useNetwork } from "./state/network.jsx";
import { Header } from "./components/Header.jsx";
import { Home } from "./components/Home.jsx";
import { SearchPage } from "./components/SearchPage.jsx";
import { ConsultantsPage } from "./components/ConsultantsPage.jsx";
import { FairsPage } from "./components/FairsPage.jsx";
import { MessagesPage } from "./components/MessagesPage.jsx";
import { Results } from "./components/Results.jsx";
import { CompanyPage } from "./components/CompanyPage.jsx";
import { RfqModal } from "./components/RfqModal.jsx";

export default function App() {
  const [view, setView] = useState("home");
  const [prevView, setPrevView] = useState("results");
  const [query, setQuery] = useState("");
  const [input, setInput] = useState("");
  const [activeCategory, setActiveCategory] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [hoveredId, setHoveredId] = useState(null);
  const [rfqOpen, setRfqOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [rfqs, setRfqs] = useState([]);
  const [rfqSent, setRfqSent] = useState(false);
  const [activeContact, setActiveContact] = useState(null);
  const [selectedFair, setSelectedFair] = useState(null);

  const companies = useCompanies();
  const { loading, error } = useCompaniesState();
  const net = useNetwork();
  const results = useMemo(() => searchCompanies(companies, query, activeCategory), [companies, query, activeCategory]);
  const company = useMemo(() => companies.find((c) => c.id === selectedId) || null, [companies, selectedId]);
  const intent = useMemo(() => (query ? interpretQuery(query) : null), [query]);

  useEffect(() => { window.scrollTo(0, 0); }, [view, selectedId]);

  const goSearch = (q, cat = null) => {
    if (q && /consulen/i.test(q)) { setView("consultants"); return; }
    net.logSearch(q);
    setQuery(q || ""); setInput(q || ""); setActiveCategory(cat); setView("results");
  };
  const goHome = () => { setView("home"); setActiveCategory(null); setQuery(""); setInput(""); };
  const openCompany = (id) => { setPrevView(view === "company" ? prevView : view); setSelectedId(id); setView("company"); setRfqSent(false); setContactOpen(false); };
  const submitRfq = (form) => {
    setRfqs((p) => [...p, { id: "rfq" + Date.now(), companyId: company.id, ...form, createdAt: new Date().toISOString(), status: "inviata" }]);
    net.logRfq(company.id, company.name);
    setRfqOpen(false); setRfqSent(true);
  };
  const openContact = (id) => { setActiveContact(id); setView("messages"); };
  const nav = (v) => { setView(v); if (v !== "fairs") setSelectedFair(null); };

  return (
    <div className="texa">
      <Header view={view} onNav={nav} onHome={goHome} rfqCount={rfqs.length} />

      {loading && <div className="data-note">Caricamento del database fornitori da Supabase…</div>}
      {!loading && error && <div className="data-note err">Database non raggiungibile: {error}</div>}
      {!loading && !error && companies.length === 0 && (
        <div className="data-note err">Il database Supabase non contiene ancora fornitori: aggiungi le anagrafiche alla tabella "companies".</div>
      )}

      {view === "home" && <Home onSearch={goSearch} onCategory={(c) => goSearch("", c)} onFairs={() => nav("fairs")} onConsultants={() => nav("consultants")} />}
      {view === "search" && <SearchPage onSearch={goSearch} onCategory={(c) => goSearch("", c)} onOpenCompany={openCompany} />}
      {view === "consultants" && <ConsultantsPage onOpenCompany={openCompany} />}
      {view === "fairs" && <FairsPage selected={selectedFair} setSelected={setSelectedFair} />}
      {view === "messages" && (
        <MessagesPage activeId={activeContact} setActiveId={setActiveContact} onOpenCompany={openCompany} />
      )}
      {view === "results" && (
        <Results
          input={input} setInput={setInput}
          onSubmit={() => { net.logSearch(input); setQuery(input); setActiveCategory(null); }}
          onSearch={goSearch}
          results={results} intent={intent}
          activeCategory={activeCategory} setActiveCategory={setActiveCategory}
          hoveredId={hoveredId} setHoveredId={setHoveredId}
          onOpen={openCompany}
        />
      )}
      {view === "company" && company && (
        <CompanyPage c={company} onBack={() => setView(prevView === "messages" ? "messages" : "results")}
          onRfq={() => setRfqOpen(true)} onMessage={() => openContact(company.id)}
          contactOpen={contactOpen} setContactOpen={setContactOpen} rfqSent={rfqSent} />
      )}
      {rfqOpen && company && <RfqModal c={company} onClose={() => setRfqOpen(false)} onSubmit={submitRfq} />}

      <footer className="foot">
        <div className="foot-giant" aria-hidden="true">TEXA</div>
        <div className="foot-row">
          <span>Textile Network & Marketplace</span>
          <span>{companies.length} suppliers · Made in Italy</span>
        </div>
      </footer>
    </div>
  );
}
