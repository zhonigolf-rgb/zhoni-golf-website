import React from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App.jsx";
import { AnalyticsConsent } from "./analytics.jsx";
import "./styles.css";
import "./conversion.css";
import "./analytics.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
    <AnalyticsConsent />
  </React.StrictMode>,
);
