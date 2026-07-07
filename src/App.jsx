import React, { useState, useEffect, useMemo } from "react";
import { COMPANIES } from "./data/companies.js";
import { SEED_THREADS, autoReply } from "./data/threads.js";
import { searchCompanies, interpretQuery } from "./lib/search.js";
import { Header } from "./components/Header.jsx";
import { Home } from "./components/Home.jsx";
import { SearchPage } from "./components/SearchPage.jsx";
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
  const [threads, setThreads] = useState(SEED_THREADS);
  const [activeThread, setActiveThread] = useState(SEED_THREADS[0].companyId);
  const [selectedFair, setSelectedFair] = useState(null);

  const results = useMemo(() => searchCompanies(query, activeCategory), [query, activeCategory]);
  const company = useMemo(() => COMPANIES.find((c) => c.id === selectedId) || null, [selectedId]);
  const intent = useMemo(() => (query ? interpretQuery(query) : null), [query]);

  useEffect(() => { window.scrollTo(0, 0); }, [view, selectedId]);

  const goSearch = (q, cat = null) => { setQuery(q || ""); setInput(q || ""); setActiveCategory(cat); setView("results"); };
  const goHome = () => { setView("home"); setActiveCategory(null); setQuery(""); setInput(""); };
  const openCompany = (id) => { setPrevView(view === "company" ? prevView : view); setSelectedId(id); setView("company"); setRfqSent(false); setContactOpen(false); };
  const submitRfq = (form) => {
    setRfqs((p) => [...p, { id: "rfq" + Date.now(), companyId: company.id, ...form, createdAt: new Date().toISOString(), status: "inviata" }]);
    setRfqOpen(false); setRfqSent(true);
  };
  const openThread = (id) => {
    setThreads((p) => (p.some((t) => t.companyId === id) ? p : [{ companyId: id, msgs: [] }, ...p]));
    setActiveThread(id);
    setView("messages");
  };
  const sendMsg = (companyId, text) => {
    const ts = () => new Date().toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" });
    setThreads((p) => p.map((t) => (t.companyId === companyId ? { ...t, msgs: [...t.msgs, { id: "u" + Date.now(), from: "me", text, at: ts() }] } : t)));
    setTimeout(() => {
      setThreads((p) => p.map((t) => (t.companyId === companyId ? { ...t, msgs: [...t.msgs, { id: "s" + Date.now(), from: "sup", text: autoReply(t.msgs.length), at: ts() }] } : t)));
    }, 1400);
  };
  const nav = (v) => { setView(v); if (v !== "fairs") setSelectedFair(null); };

  return (
    <div className="texa">
      <Header view={view} onNav={nav} onHome={goHome} rfqCount={rfqs.length} />

      {view === "home" && <Home onSearch={goSearch} onCategory={(c) => goSearch("", c)} onFairs={() => nav("fairs")} />}
      {view === "search" && <SearchPage onSearch={goSearch} onCategory={(c) => goSearch("", c)} />}
      {view === "fairs" && <FairsPage selected={selectedFair} setSelected={setSelectedFair} />}
      {view === "messages" && (
        <MessagesPage threads={threads} activeId={activeThread} setActiveId={setActiveThread}
          onSend={sendMsg} onStart={openThread} onOpenCompany={openCompany} />
      )}
      {view === "results" && (
        <Results
          input={input} setInput={setInput}
          onSubmit={() => { setQuery(input); setActiveCategory(null); }}
          results={results} intent={intent}
          activeCategory={activeCategory} setActiveCategory={setActiveCategory}
          hoveredId={hoveredId} setHoveredId={setHoveredId}
          onOpen={openCompany}
        />
      )}
      {view === "company" && company && (
        <CompanyPage c={company} onBack={() => setView(prevView === "messages" ? "messages" : "results")}
          onRfq={() => setRfqOpen(true)} onMessage={() => openThread(company.id)}
          contactOpen={contactOpen} setContactOpen={setContactOpen} rfqSent={rfqSent} />
      )}
      {rfqOpen && company && <RfqModal c={company} onClose={() => setRfqOpen(false)} onSubmit={submitRfq} />}

      <footer className="foot">
        <div className="foot-giant" aria-hidden="true">TEXA</div>
        <div className="foot-row">
          <span>Textile Network & Marketplace</span>
          <span>{COMPANIES.length} suppliers · Made in Italy</span>
        </div>
      </footer>
    </div>
  );
}
