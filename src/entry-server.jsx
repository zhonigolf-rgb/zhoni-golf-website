import React from "react";
import { renderToString } from "react-dom/server";
import { App } from "./App.jsx";
import { AnalyticsConsent } from "./analytics.jsx";
import { CanadianFrenchSite } from "./CanadianFrenchSite.jsx";
import { KoreanSite } from "./KoreanSite.jsx";
import { JapaneseSite } from "./JapaneseSite.jsx";
import { setServerPathname } from "./locale.jsx";
import { faqEntitiesFromMarkup, schemaForRoute } from "./seo.js";
import { findRoute, siteRoutes } from "./siteRoutes.js";

export function renderPage(pathname) {
  const route = findRoute(pathname) ?? siteRoutes.home;
  setServerPathname(route.path);

  const markup = renderToString(
    <React.StrictMode>
      <App
        initialRoute={route}
        KoreanSiteComponent={KoreanSite}
        CanadianFrenchSiteComponent={CanadianFrenchSite}
        JapaneseSiteComponent={JapaneseSite}
      />
      <AnalyticsConsent />
    </React.StrictMode>,
  );
  return { markup, structuredData: schemaForRoute(route, faqEntitiesFromMarkup(markup)) };
}
