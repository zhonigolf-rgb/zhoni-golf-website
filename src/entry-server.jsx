import React from "react";
import { renderToString } from "react-dom/server";
import { App } from "./App.jsx";
import { AnalyticsConsent } from "./analytics.jsx";
import { CanadianFrenchSite } from "./CanadianFrenchSite.jsx";
import { KoreanSite } from "./KoreanSite.jsx";
import { setServerPathname } from "./locale.jsx";
import { findRoute, siteRoutes } from "./siteRoutes.js";

export function render(pathname) {
  const route = findRoute(pathname) ?? siteRoutes.home;
  setServerPathname(route.path);

  return renderToString(
    <React.StrictMode>
      <App
        initialRoute={route}
        KoreanSiteComponent={KoreanSite}
        CanadianFrenchSiteComponent={CanadianFrenchSite}
      />
      <AnalyticsConsent />
    </React.StrictMode>,
  );
}
