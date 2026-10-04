export const siteRoutes = {
  home: { path: "/", source: "homepage", title: "Custom Golf Merchandise for Clubs, Events & Brands", description: "Custom golf merchandise, coordinated gift sets and packaging for clubs, events and brands." },
  products: { path: "/products/", source: "products-hub", title: "Custom Golf Products Designed as a Collection", description: "Explore custom golf headcovers, towels, accessories, gift sets and packaging." },
  headcovers: { path: "/custom-golf-headcovers/", source: "custom-golf-headcovers", title: "Custom Golf Headcovers for Clubs, Events & Brands", description: "Custom golf headcovers planned around your club, tournament or brand project." },
  towels: { path: "/custom-golf-towels/", source: "custom-golf-towels", title: "Custom Golf Towels with Considered Branding Details", description: "Custom golf towels for player packs, club collections and branded gifting." },
  accessories: { path: "/custom-golf-accessories/", source: "custom-golf-accessories", title: "Custom Golf Accessories for Player Gifting", description: "Pouches, bag tags, ball markers and divot tools for considered golf projects." },
  packaging: { path: "/custom-golf-packaging/", source: "custom-golf-packaging", title: "Custom Golf Packaging for a Complete Gift Moment", description: "Custom golf packaging, presentation boxes and finishing details for B2B projects." },
  solutions: { path: "/solutions/", source: "solutions-hub", title: "Custom Golf Gift Solutions", description: "Golf gift solutions for tournaments, corporate programs, clubs and private-label brands." },
  golfGifts: { path: "/custom-golf-gifts/", source: "custom-golf-gifts-hub", title: "Custom Golf Gifts | Gift Sets and Single-Product Customisation", description: "Custom golf gift sets, headcovers, towels, ball markers, accessories and presentation packaging for B2B projects." },
  golfGiftGuide: { path: "/guides/how-to-choose-custom-golf-gifts/", source: "custom-golf-gifts-guide", title: "How to Choose Custom Golf Gifts", description: "A procurement guide to custom golf gift sets, single products, corporate gifts and tournament player packs." },
  audienceGiftGuide: { path: "/guides/how-to-choose-golf-gifts-by-audience/", source: "golf-gifts-audience-guide", title: "How to Choose Golf Gifts for Your Audience", description: "Compare custom golf gifts for clients, tournament players and club members." },
  brandingGuide: { path: "/guides/branding-methods-for-premium-golf-merchandise/", source: "golf-branding-methods-guide", title: "Branding Methods for Premium Golf Merchandise", description: "A procurement guide to golf merchandise branding, artwork, samples and packaging." },
  artworkGuide: { path: "/guides/prepare-artwork-for-custom-golf-products/", source: "golf-artwork-preparation-guide", title: "Prepare Artwork for Custom Golf Products", description: "Artwork, logo-file, colour, placement and sample preparation guide for custom golf products." },
  headcoversGuide: { path: "/guides/custom-golf-headcovers-procurement-guide/", source: "custom-golf-headcovers-guide", title: "Custom Golf Headcovers Procurement Guide", description: "A buyer guide to planning custom golf headcovers for clubs, tournaments and brands." },
  towelsGuide: { path: "/guides/custom-golf-towels-procurement-guide/", source: "custom-golf-towels-guide", title: "Custom Golf Towels Procurement Guide", description: "A buyer guide to planning custom golf towels, branding details and project inputs." },
  tournamentGuide: { path: "/guides/golf-tournament-player-packs/", source: "golf-tournament-player-packs-guide", title: "Golf Tournament Player Packs Guide", description: "A buyer guide to planning useful, branded golf tournament player packs." },
  corporateGuide: { path: "/guides/corporate-golf-gifts-procurement-guide/", source: "corporate-golf-gifts-guide", title: "Corporate Golf Gifts Procurement Guide", description: "A buyer guide to planning custom corporate golf gifts for clients, teams and events." },
  packagingGuide: { path: "/guides/custom-golf-packaging-procurement-guide/", source: "custom-golf-packaging-guide", title: "Custom Golf Packaging Procurement Guide", description: "A buyer guide to presentation boxes, inserts and packaging inputs for golf merchandise." },
  firstOrder: { path: "/first-order-guide/", source: "custom-golf-first-order-guide", title: "MOQ, Quote & First Order", description: "A project-specific guide to preparing a custom golf merchandise first order." },
  exportReadiness: { path: "/quality-packaging-export-readiness/", source: "quality-packaging-export-readiness", title: "Quality, Packaging & Export Readiness", description: "Project-specific quality, packaging and export readiness guidance for custom golf merchandise." },
  tournamentGifts: { path: "/solutions/golf-tournament-gifts/", source: "golf-tournament-gifts", title: "Golf Tournament Gifts & Player Packs", description: "Golf tournament gifts and coordinated player packs planned around the event experience." },
  corporateGifts: { path: "/solutions/corporate-golf-gifts/", source: "corporate-golf-gifts", title: "Corporate Golf Gifts", description: "Corporate golf gifts planned around the recipient, brand and occasion." },
  about: { path: "/about/", source: "about-zhoni", title: "About ZHONI | Custom Golf Merchandise", description: "Learn how ZHONI supports custom golf merchandise projects for clubs, events, brands and business teams." },
  process: { path: "/our-process/", source: "custom-golf-process", title: "Our Process | ZHONI Custom Golf Merchandise", description: "A clear custom golf merchandise process from project brief to delivery coordination." },
  capabilities: { path: "/capabilities/", source: "golf-merchandise-capabilities", title: "Custom Golf Merchandise Capabilities & FAQ | ZHONI", description: "Product direction, branding, gift set planning, custom packaging and procurement answers for golf projects." },
  faq: { path: "/faq/", source: "custom-golf-faq", title: "Custom Golf Merchandise FAQ | ZHONI", description: "Answers to common questions about custom golf products, gift sets, MOQ, timing and brand application." },
  quote: { path: "/request-a-quote/", source: "direct-quote", title: "Request a Custom Golf Project Quote", description: "Share your custom golf merchandise project brief." },
};

export function normalizePath(pathname) {
  if (!pathname || pathname === "/") return "/";
  return `${pathname.replace(/\/+$/, "")}/`;
}

export function findRoute(pathname) {
  const normalized = normalizePath(pathname);
  return Object.values(siteRoutes).find(route => route.path === normalized) ?? null;
}
