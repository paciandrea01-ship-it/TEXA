import React from "react";
import { createRoot } from "react-dom/client";
import "./styles/global.css";
import App from "./App.jsx";
import { CompaniesProvider } from "./state/companies.jsx";

createRoot(document.getElementById("root")).render(
  <CompaniesProvider>
    <App />
  </CompaniesProvider>
);
