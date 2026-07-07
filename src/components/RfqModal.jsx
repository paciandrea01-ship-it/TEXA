import React, { useState } from "react";

export function RfqModal({ c, onClose, onSubmit }) {
  const [form, setForm] = useState({ product: "", quantity: "", message: "", contactName: "", contactEmail: "" });
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const valid = form.product && form.contactName && form.contactEmail.includes("@");
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Richiedi preventivo">
        <div className="modal-top">
          <h3>Richiedi preventivo</h3>
          <button className="x" onClick={onClose} aria-label="Chiudi">✕</button>
        </div>
        <p className="modal-sub">a {c.name} · {c.city}</p>
        <label>Prodotto o materiale<input value={form.product} onChange={set("product")} placeholder="Es. filato di lino Nm 12" /></label>
        <label>Quantità indicativa<input value={form.quantity} onChange={set("quantity")} placeholder="Es. 500 kg / 1.000 paia" /></label>
        <label>Messaggio<textarea rows="3" value={form.message} onChange={set("message")} placeholder="Descrivi la tua esigenza…" /></label>
        <div className="two">
          <label>Il tuo nome<input value={form.contactName} onChange={set("contactName")} placeholder="Nome e cognome" /></label>
          <label>La tua email<input type="email" value={form.contactEmail} onChange={set("contactEmail")} placeholder="nome@azienda.it" /></label>
        </div>
        <button className="btn primary wide" disabled={!valid} onClick={() => onSubmit(form)}>Invia richiesta →</button>
      </div>
    </div>
  );
}
