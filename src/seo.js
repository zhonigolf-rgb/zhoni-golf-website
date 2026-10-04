import { findRoute, siteRoutes } from "./siteRoutes";

export const SITE_ORIGIN = (import.meta.env.VITE_SITE_URL ?? "https://zhonigolf.com").replace(/\/$/, "");
const SAFE_SOURCE = /^[a-z0-9-]{3,120}$/;

const breadcrumbNames = {
  "/": "Home",
  "/products/": "Products",
  "/custom-golf-headcovers/": "Custom Golf Headcovers",
  "/custom-golf-towels/": "Custom Golf Towels",
  "/custom-golf-accessories/": "Custom Golf Accessories",
  "/custom-golf-packaging/": "Custom Golf Packaging",
  "/solutions/": "Solutions",
  "/custom-golf-gifts/": "Custom Golf Gifts",
  "/guides/": "Buyer Guides",
  "/guides/how-to-choose-custom-golf-gifts/": "How to Choose Custom Golf Gifts",
  "/guides/how-to-choose-golf-gifts-by-audience/": "Golf Gifts by Audience",
  "/guides/branding-methods-for-premium-golf-merchandise/": "Golf Branding Methods",
  "/guides/prepare-artwork-for-custom-golf-products/": "Prepare Golf Product Artwork",
  "/guides/custom-golf-headcovers-procurement-guide/": "Custom Golf Headcovers Procurement Guide",
  "/guides/custom-golf-towels-procurement-guide/": "Custom Golf Towels Procurement Guide",
  "/guides/golf-tournament-player-packs/": "Golf Tournament Player Packs Guide",
  "/guides/corporate-golf-gifts-procurement-guide/": "Corporate Golf Gifts Procurement Guide",
  "/guides/custom-golf-packaging-procurement-guide/": "Custom Golf Packaging Procurement Guide",
  "/first-order-guide/": "MOQ, Quote & First Order",
  "/quality-packaging-export-readiness/": "Quality, Packaging & Export Readiness",
  "/solutions/golf-tournament-gifts/": "Golf Tournament Gifts",
  "/solutions/corporate-golf-gifts/": "Corporate Golf Gifts",
  "/about/": "About ZHONI",
  "/our-process/": "Our Process",
  "/capabilities/": "Capabilities",
  "/faq/": "FAQ",
  "/request-a-quote/": "Request a Quote",
};

const faqEntities = [
  ["What custom golf products can be discussed?", "ZHONI can discuss coordinated golf merchandise including headcovers, towels, accessories, ball markers, divot tools, golf balls, gift sets and presentation packaging. The appropriate route depends on the purpose, product direction and project brief."],
  ["What should we include in a project brief?", "A useful starting point is the product or occasion, approximate quantity, target date, destination, brand assets and any packaging expectations. Reference images are useful when you have them."],
  ["What is the MOQ for custom golf merchandise?", "MOQ varies by product, material, construction, decoration method, colour, packaging and customisation depth. Share the product direction and estimated quantity so the applicable requirements can be reviewed."],
  ["Can packaging be included in the project?", "Yes. Boxes, inserts, sleeves, cards, labels and presentation details can be considered alongside the selected products. Packaging requirements are reviewed as part of the complete project scope."],
  ["What types of projects are a good fit for ZHONI?", "ZHONI is relevant for clubs, tournaments, corporate teams and brands that need coordinated support across custom golf merchandise, manufacturing coordination, branding, quality checks, packaging and export preparation."],
];

function absolute(path) {
  return `${SITE_ORIGIN}${path}`;
}

function setMeta(attribute, key, content) {
  let node = document.head.querySelector(`meta[${attribute}="${key}"]`);
  if (!node) {
    node = document.createElement("meta");
    node.setAttribute(attribute, key);
    document.head.appendChild(node);
  }
  node.content = content;
}

function setCanonical(url) {
  let node = document.head.querySelector('link[rel="canonical"]');
  if (!node) {
    node = document.createElement("link");
    node.rel = "canonical";
    document.head.appendChild(node);
  }
  node.href = url;
}

function schemaFor(route, canonical) {
  const companyId = `${SITE_ORIGIN}/#company`;
  const brandId = `${SITE_ORIGIN}/#brand`;
  const websiteId = `${SITE_ORIGIN}/#website`;
  const guideRoutes = [siteRoutes.golfGiftGuide, siteRoutes.audienceGiftGuide, siteRoutes.brandingGuide, siteRoutes.artworkGuide, siteRoutes.headcoversGuide, siteRoutes.towelsGuide, siteRoutes.tournamentGuide, siteRoutes.corporateGuide, siteRoutes.packagingGuide, siteRoutes.firstOrder, siteRoutes.exportReadiness];
  const graph = [
    {
      "@type": "Organization", "@id": companyId,
      name: "Xiamen Jindongyu Trading Co., Ltd.", legalName: "Xiamen Jindongyu Trading Co., Ltd.",
      description: "China-based custom golf merchandise manufacturing and sourcing partner for clubs, tournaments, corporate teams and brands.",
      url: SITE_ORIGIN, email: "sales@zhonigolf.com", telephone: "+8617759190848", areaServed: "International",
      contactPoint: { "@type": "ContactPoint", contactType: "sales", email: "sales@zhonigolf.com", telephone: "+8617759190848", availableLanguage: "English" },
    },
    { "@type": "Brand", "@id": brandId, name: "ZHONI", description: "Custom golf merchandise, golf gift sets and custom packaging for clubs, events and brands.", url: SITE_ORIGIN, brandOf: { "@id": companyId } },
    { "@type": "WebSite", "@id": websiteId, name: "ZHONI", url: SITE_ORIGIN, inLanguage: "en", publisher: { "@id": companyId }, about: { "@id": brandId } },
    { "@type": "WebPage", "@id": `${canonical}#webpage`, url: canonical, name: route.title, description: route.description, inLanguage: "en", isPartOf: { "@id": websiteId }, about: { "@id": brandId } },
  ];

  if (route.path !== "/") {
    graph.push({
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: absolute("/") },
        { "@type": "ListItem", position: 2, name: breadcrumbNames[route.path] ?? route.title, item: canonical },
      ],
    });
  }

  if ([siteRoutes.headcovers, siteRoutes.towels, siteRoutes.accessories, siteRoutes.packaging, siteRoutes.corporateGifts, siteRoutes.tournamentGifts].includes(route)) {
    graph.push({ "@type": "Service", name: route.title, description: route.description, provider: { "@id": companyId }, brand: { "@id": brandId }, url: canonical, areaServed: "International" });
  }

  if ([siteRoutes.golfGifts, siteRoutes.guides].includes(route)) {
    graph.push({
      "@type": "CollectionPage", name: route === siteRoutes.guides ? "Golf Merchandise Buyer Guides" : "Custom Golf Gifts Procurement Guides", url: canonical, isPartOf: { "@id": websiteId }, about: { "@id": brandId },
      mainEntity: { "@type": "ItemList", name: route === siteRoutes.guides ? "Golf Merchandise Buyer Guide Collection" : "Custom Golf Gifts Guide Collection", itemListElement: guideRoutes.map((guide, index) => ({ "@type": "ListItem", position: index + 1, name: guide.title, url: absolute(guide.path) })) },
    });
  }

  if (route === siteRoutes.faq) {
    graph.push({ "@type": "FAQPage", mainEntity: faqEntities.map(([name, text]) => ({ "@type": "Question", name, acceptedAnswer: { "@type": "Answer", text } })) });
  }

  return { "@context": "https://schema.org", "@graph": graph };
}

export function applySeo(route) {
  const canonical = absolute(route.path);
  document.documentElement.lang = "en";
  document.title = route.title;
  setMeta("name", "description", route.description);
  setMeta("name", "robots", "index,follow");
  setMeta("property", "og:title", route.title);
  setMeta("property", "og:description", route.description);
  setMeta("property", "og:type", "website");
  setMeta("property", "og:url", canonical);
  setCanonical(canonical);

  let schema = document.getElementById("zhoni-page-schema");
  if (!schema) {
    schema = document.createElement("script");
    schema.id = "zhoni-page-schema";
    schema.type = "application/ld+json";
    document.head.appendChild(schema);
  }
  schema.textContent = JSON.stringify(schemaFor(route, canonical)).replace(/</g, "\\u003c");
}

export function inquirySourceForLocation() {
  const explicit = new URLSearchParams(window.location.search).get("source")?.toLowerCase();
  if (explicit && SAFE_SOURCE.test(explicit)) return explicit;
  try {
    const referrer = new URL(document.referrer);
    if (referrer.origin === window.location.origin) return findRoute(referrer.pathname)?.source ?? "direct-quote";
  } catch {
    // A direct visit has no usable same-site referral.
  }
  return findRoute(window.location.pathname)?.source ?? "direct-quote";
}

export function addInquirySource(href, currentRoute) {
  const url = new URL(href, window.location.origin);
  if (url.origin !== window.location.origin || !url.pathname.startsWith("/request-a-quote")) return url;
  const existing = url.searchParams.get("source")?.toLowerCase();
  if (!existing || !SAFE_SOURCE.test(existing)) url.searchParams.set("source", currentRoute.source ?? "direct-quote");
  return url;
}
