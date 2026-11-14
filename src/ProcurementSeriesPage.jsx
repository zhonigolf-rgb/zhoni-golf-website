import { currentSiteRoute } from "./locale.jsx";
import { ProcurementArticlePage } from "./ProcurementArticlePage.jsx";
import { procurementArticleRoutes } from "./content/procurement-article-meta.js";
import { procurementSeries, seriesArticleKey } from "./content/procurement-series.js";

// The parent language chunk supplies its own dataset; other languages are not imported here.
export function ProcurementSeriesPage({ series, content, Header, Footer, route = currentSiteRoute() }) {
  const key = seriesArticleKey(route);
  if (!key) return null;
  const family = procurementSeries[key].family;
  const base = content.articles[family];
  const source = series.articles[key];
  const article = { ...source, imageAlt: base.imageAlt, related: base.related, close: { ...source.close, cta: source.close.cta || base.close.cta } };
  return <ProcurementArticlePage content={{ ...content, articles: { [key]: article } }} articleKey={key} articleConfig={{ ...procurementArticleRoutes[family], family }} Header={Header} Footer={Footer} route={route} />;
}
