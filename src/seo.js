import { findRoute, siteRoutes } from "./siteRoutes";

export const SITE_ORIGIN = (import.meta.env.VITE_SITE_URL ?? "https://zhonigolf.com").replace(/\/$/, "");
const SAFE_SOURCE = /^[a-z0-9-]{3,120}$/;

const breadcrumbNames = {
  "/": "Home",
  "/products/": "Products",
  "/custom-golf-headcovers/": "Custom Golf Headcovers",
  "/custom-golf-caps/": "Custom Golf Caps & Headwear",
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
  "/guides/custom-golf-headcover-materials/": "Custom Golf Headcover Materials",
  "/guides/custom-golf-headcover-types/": "Custom Golf Headcover Types",
  "/guides/custom-golf-product-specification-sheet/": "Custom Golf Product Specification",
  "/guides/custom-golf-sample-approval-checklist/": "Custom Golf Sample Approval Checklist",
  "/guides/coordinated-golf-accessory-collection/": "Coordinated Golf Accessory Collection",
  "/guides/headcover-logo-methods-and-placement/": "Headcover Logo Methods and Placement",
  "/guides/custom-golf-caps-and-visors/": "Custom Golf Caps and Visors",
  "/guides/custom-golf-cap-materials/": "Custom Golf Cap Materials",
  "/guides/custom-golf-cap-logo-placement/": "Custom Golf Cap Logo Placement and Branding",
  "/guides/custom-golf-product-development-brief/": "Custom Golf Product Development Brief",
  "/guides/golf-tournament-gift-budget-planning/": "Golf Tournament Gift Budget Planning",
  "/guides/how-to-build-a-golf-player-pack/": "How to Build a Golf Player Pack",
  "/guides/tournament-gifts-sponsor-gifts-and-winner-prizes/": "Tournament Gifts, Sponsor Gifts and Winner Prizes",
  "/guides/how-to-build-a-premium-golf-gift-set/": "How to Build a Premium Golf Gift Set",
  "/guides/what-to-include-in-a-golf-event-brief/": "What to Include in a Golf Event Brief",
  "/guides/how-to-compare-custom-golf-product-quotes/": "How to Compare Custom Golf Product Quotes",
  "/guides/what-affects-a-custom-golf-merchandise-quote/": "What Affects a Custom Golf Merchandise Quote",
  "/guides/custom-golf-merchandise-moq-explained/": "Custom Golf Merchandise MOQ Explained",
  "/guides/custom-golf-merchandise-quality-checklist/": "Custom Golf Merchandise Quality Checklist",
  "/guides/how-to-plan-a-golf-merchandise-delivery-date/": "How to Plan a Golf Merchandise Delivery Date",
  "/guides/what-happens-after-a-custom-golf-project-brief/": "What Happens After a Custom Golf Project Brief",
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
  ["What custom golf products can be discussed?", "ZHONI can discuss coordinated golf merchandise including headcovers, caps and visors, towels, accessories, ball markers, divot tools, golf balls, gift sets and presentation packaging. The appropriate route depends on the purpose, product direction and project brief."],
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

function setLanguageAlternates(route) {
  document.head.querySelectorAll('link[data-zhoni-hreflang]').forEach(node => node.remove());
  const englishPath = route.lang === "ko" ? route.alternatePath : route.path;
  const koreanRoute = route.lang === "ko" ? route : Object.values(siteRoutes).find(candidate => candidate.lang === "ko" && candidate.alternatePath === route.path);
  const alternates = [["en", englishPath], ["x-default", englishPath]];
  if (koreanRoute) alternates.splice(1, 0, ["ko", koreanRoute.path]);
  alternates.forEach(([language, path]) => {
    const node = document.createElement("link");
    node.rel = "alternate";
    node.hreflang = language;
    node.href = absolute(path);
    node.dataset.zhoniHreflang = "true";
    document.head.appendChild(node);
  });
}

function schemaFor(route, canonical) {
  const language = route.lang ?? "en";
  const companyId = `${SITE_ORIGIN}/#company`;
  const brandId = `${SITE_ORIGIN}/#brand`;
  const websiteId = `${SITE_ORIGIN}/#website`;
  const guideRoutes = [siteRoutes.golfGiftGuide, siteRoutes.audienceGiftGuide, siteRoutes.brandingGuide, siteRoutes.artworkGuide, siteRoutes.headcoversGuide, siteRoutes.towelsGuide, siteRoutes.tournamentGuide, siteRoutes.corporateGuide, siteRoutes.packagingGuide, siteRoutes.headcoverMaterialsGuide, siteRoutes.headcoverTypesGuide, siteRoutes.productSpecificationGuide, siteRoutes.sampleApprovalGuide, siteRoutes.collectionPlanningGuide, siteRoutes.headcoverLogoGuide, siteRoutes.capsStyleGuide, siteRoutes.capsMaterialsGuide, siteRoutes.capsBrandingGuide, siteRoutes.productDevelopmentBriefGuide, siteRoutes.tournamentGiftBudgetGuide, siteRoutes.playerPackGuide, siteRoutes.recipientRolesGuide, siteRoutes.premiumGiftSetGuide, siteRoutes.eventBriefGuide, siteRoutes.quoteComparisonGuide, siteRoutes.quoteFactorsGuide, siteRoutes.moqGuide, siteRoutes.qualityChecklistGuide, siteRoutes.deliveryDateGuide, siteRoutes.postBriefGuide, siteRoutes.firstOrder, siteRoutes.exportReadiness];
  const graph = [
    {
      "@type": "Organization", "@id": companyId,
      name: "Xiamen Jindongyu Trading Co., Ltd.", legalName: "Xiamen Jindongyu Trading Co., Ltd.",
      description: "China-based custom golf merchandise manufacturing and sourcing partner for clubs, tournaments, corporate teams and brands.",
      url: SITE_ORIGIN, email: "sales@zhonigolf.com", telephone: "+8617759190848", areaServed: "International",
      contactPoint: { "@type": "ContactPoint", contactType: "sales", email: "sales@zhonigolf.com", telephone: "+8617759190848", availableLanguage: ["English", "Korean"] },
    },
    { "@type": "Brand", "@id": brandId, name: "ZHONI", description: "Custom golf merchandise, golf gift sets and custom packaging for clubs, events and brands.", url: SITE_ORIGIN, brandOf: { "@id": companyId } },
    { "@type": "WebSite", "@id": websiteId, name: "ZHONI", url: SITE_ORIGIN, inLanguage: ["en", "ko"], publisher: { "@id": companyId }, about: { "@id": brandId } },
    { "@type": "WebPage", "@id": `${canonical}#webpage`, url: canonical, name: route.title, description: route.description, inLanguage: language, isPartOf: { "@id": websiteId }, about: { "@id": brandId } },
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

  if ([siteRoutes.headcovers, siteRoutes.caps, siteRoutes.towels, siteRoutes.accessories, siteRoutes.packaging, siteRoutes.corporateGifts, siteRoutes.tournamentGifts].includes(route)) {
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
  document.documentElement.lang = route.lang ?? "en";
  document.title = route.title;
  setMeta("name", "description", route.description);
  setMeta("name", "robots", "index,follow");
  setMeta("property", "og:title", route.title);
  setMeta("property", "og:description", route.description);
  setMeta("property", "og:type", "website");
  setMeta("property", "og:url", canonical);
  setCanonical(canonical);
  setLanguageAlternates(route);

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
