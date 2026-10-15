import React from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { AnalyticsConsent } from "./analytics.jsx";
import "./fonts.css";
import "./styles.css";
import "./conversion.css";
import "./analytics.css";

const rootElement = document.getElementById("root");
async function bootstrap() {
  const isEnglishHome = window.location.pathname === "/";
  const pageModule = isEnglishHome ? await import("./HomePage.jsx") : await import("./App.jsx");
  const Page = isEnglishHome ? pageModule.HomePage : pageModule.App;
  const application = <React.StrictMode><Page /><AnalyticsConsent /></React.StrictMode>;
  if (rootElement.hasChildNodes()) hydrateRoot(rootElement, application);
  else createRoot(rootElement).render(application);
}

bootstrap();
