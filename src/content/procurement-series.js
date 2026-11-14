import { procurementSeriesMeta } from "./procurement-series-meta.js";

export const procurementSeries = {
  towelRange: { slug: "private-label-golf-towels-pro-shop-product-range", family: "towels" },
  towelLogos: { slug: "custom-golf-towel-logos-embroidery-vs-printing", family: "towels" },
  capReorders: { slug: "reordering-custom-golf-caps-brand-consistency", family: "caps" },
  capVersions: { slug: "custom-golf-caps-multiple-logo-versions", family: "caps" },
  mascotRange: { slug: "mascot-plush-golf-headcover-collection-variants", family: "plush" },
};
const localePrefixes = { en: "", ko: "/ko", "fr-CA": "/fr-ca", ja: "/ja", de: "/de" };
const labels = { en: "PRODUCT BUYING GUIDE", ko: "제품 구매 가이드", "fr-CA": "GUIDE D’ACHAT", ja: "製品購入ガイド", de: "PRODUKTRATGEBER" };
export function seriesArticleKey(route) {
  return Object.keys(procurementSeries).find(key => `/guides/${procurementSeries[key].slug}/` === (route?.alternatePath ?? route?.path));
}
export function seriesCatalog(locale) {
  return Object.entries(procurementSeries).map(([key, config]) => ({ key, category: config.family === "caps" ? "headwear" : config.family === "plush" ? "plush" : "product", group: config.family === "plush" ? "plush" : "product", label: labels[locale], title: procurementSeriesMeta[locale][key].title.replace(/\s*[|｜]\s*ZHONI$/, ""), copy: procurementSeriesMeta[locale][key].description, href: `${localePrefixes[locale]}/guides/${config.slug}/` }));
}
export function registerSeriesRoutes(routes) {
  for (const [locale, prefix] of Object.entries(localePrefixes)) {
    for (const [key, config] of Object.entries(procurementSeries)) {
      const alternatePath = `/guides/${config.slug}/`;
      const meta = procurementSeriesMeta[locale][key];
      routes[`${locale.replace("-CA","Ca")}Series${key[0].toUpperCase()}${key.slice(1)}`] = {
        path: `${prefix}${alternatePath}`, source: `${prefix.slice(1) || "en"}-series-${config.slug}`,
        ...(locale === "en" ? {} : { lang: locale, alternatePath }), title: meta.title, description: meta.description,
      };
    }
  }
}
