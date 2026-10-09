import React from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { App } from "./App.jsx";
import { AnalyticsConsent } from "./analytics.jsx";
import "./styles.css";
import "./conversion.css";
import "./analytics.css";

const rootElement = document.getElementById("root");
const application = (
  <React.StrictMode>
    <App />
    <AnalyticsConsent />
  </React.StrictMode>
);

if (rootElement.hasChildNodes()) hydrateRoot(rootElement, application);
else createRoot(rootElement).render(application);
