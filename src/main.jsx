import React from "react";
import { createRoot } from "react-dom/client";
import "./styles/global.css";
import App from "./App.jsx";
import { CompaniesProvider } from "./state/companies.jsx";
import { NetworkProvider } from "./state/network.jsx";

createRoot(document.getElementById("root")).render(
  <CompaniesProvider>
    <NetworkProvider>
      <App />
    </NetworkProvider>
  </CompaniesProvider>
);
