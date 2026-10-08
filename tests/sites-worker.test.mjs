import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";
import worker from "../worker/index.js";
import { onRequest as pagesMiddleware } from "../functions/_middleware.js";
import { renderRouteDocument } from "../scripts/prerender-routes.mjs";
import { findRoute, siteRoutes } from "../src/siteRoutes.js";

test("serves existing static assets without a fallback", async () => {
  const calls = [];
  const response = await worker.fetch(new Request("https://example.test/assets/app.js"), {
    ASSETS: {
      fetch: async (request) => {
        calls.push(new URL(request.url).pathname);
        return new Response("asset", { status: 200 });
      },
    },
  });

  assert.equal(response.status, 200);
  assert.deepEqual(calls, ["/assets/app.js"]);
});

test("falls back to index.html for an unknown app route", async () => {
  const calls = [];
  const response = await worker.fetch(
    new Request("https://example.test/flow/step-two?source=share", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async (request) => {
          const url = new URL(request.url);
          calls.push(url.pathname + url.search);
          return new Response(url.pathname === "/index.html" ? "app" : "missing", {
            status: url.pathname === "/index.html" ? 200 : 404,
          });
        },
      },
    },
  );

  assert.equal(response.status, 200);
  assert.deepEqual(calls, ["/flow/step-two?source=share", "/index.html"]);
});

test("does not turn sensitive probe paths into the app shell", async () => {
  for (const path of ["/.env", "/.env.production", "/.git/HEAD", "/config/.env", "/cgi-bin/run"]) {
    const calls = [];
    const response = await worker.fetch(
      new Request(`https://example.test${path}`, { headers: { accept: "text/html" } }),
      {
        ASSETS: {
          fetch: async (request) => {
            calls.push(new URL(request.url).pathname);
            return new Response("missing", { status: 404 });
          },
        },
      },
    );

    assert.equal(response.status, 404, `Expected ${path} to remain a 404.`);
    assert.deepEqual(calls, [path], `Expected ${path} not to fall back to the app shell.`);
  }
});

test("blocks sensitive probes in the Cloudflare Pages request entrypoint", async () => {
  for (const path of ["/.env", "/.env.production", "/.git/HEAD", "/config/.env", "/cgi-bin/run"]) {
    let nextCalls = 0;
    const response = await pagesMiddleware({
      request: new Request(`https://example.test${path}`),
      next: async () => {
        nextCalls += 1;
        return new Response("app", { status: 200 });
      },
    });

    assert.equal(response.status, 404, `Expected ${path} to be blocked at the Pages entrypoint.`);
    assert.equal(nextCalls, 0, `Expected ${path} not to continue to Pages.`);
  }
});

test("keeps regular routes and real validation paths available in the Pages entrypoint", async () => {
  for (const path of ["/guides/custom-golf-caps-and-visors/", "/.well-known/acme-challenge/valid-token"]) {
    let nextCalls = 0;
    const response = await pagesMiddleware({
      request: new Request(`https://example.test${path}`),
      next: async () => {
        nextCalls += 1;
        return new Response("next", { status: 200 });
      },
    });

    assert.equal(response.status, 200, `Expected ${path} to continue through Pages.`);
    assert.equal(nextCalls, 1, `Expected ${path} to reach the next Pages handler.`);
  }
});

test("does not turn missing API or write requests into the app shell", async () => {
  for (const request of [
    new Request("https://example.test/api/missing", { headers: { accept: "application/json" } }),
    new Request("https://example.test/flow", { method: "POST", headers: { accept: "text/html" } }),
  ]) {
    let calls = 0;
    const response = await worker.fetch(request, {
      ASSETS: {
        fetch: async () => {
          calls += 1;
          return new Response("missing", { status: 404 });
        },
      },
    });

    assert.equal(response.status, 404);
    assert.equal(calls, 1);
  }
});

test("indexes every buyer guide route in the guide hub and sitemap", async () => {
  const routes = [
    "/guides/",
    "/guides/how-to-choose-custom-golf-gifts/",
    "/guides/how-to-choose-golf-gifts-by-audience/",
    "/guides/branding-methods-for-premium-golf-merchandise/",
    "/guides/prepare-artwork-for-custom-golf-products/",
    "/guides/custom-golf-headcovers-procurement-guide/",
    "/guides/custom-golf-towels-procurement-guide/",
    "/guides/golf-tournament-player-packs/",
    "/guides/corporate-golf-gifts-procurement-guide/",
    "/guides/custom-golf-packaging-procurement-guide/",
    "/guides/custom-golf-headcover-materials/",
    "/guides/custom-golf-headcover-types/",
    "/guides/custom-golf-product-specification-sheet/",
    "/guides/custom-golf-sample-approval-checklist/",
    "/guides/coordinated-golf-accessory-collection/",
    "/guides/headcover-logo-methods-and-placement/",
    "/guides/custom-golf-caps-and-visors/",
    "/guides/custom-golf-cap-materials/",
    "/guides/custom-golf-cap-logo-placement/",
    "/guides/custom-golf-product-development-brief/",
    "/guides/golf-tournament-gift-budget-planning/",
    "/guides/how-to-build-a-golf-player-pack/",
    "/guides/tournament-gifts-sponsor-gifts-and-winner-prizes/",
    "/guides/how-to-build-a-premium-golf-gift-set/",
    "/guides/what-to-include-in-a-golf-event-brief/",
    "/guides/how-to-compare-custom-golf-product-quotes/",
    "/guides/what-affects-a-custom-golf-merchandise-quote/",
    "/guides/custom-golf-merchandise-moq-explained/",
    "/guides/custom-golf-merchandise-quality-checklist/",
    "/guides/how-to-plan-a-golf-merchandise-delivery-date/",
    "/guides/what-happens-after-a-custom-golf-project-brief/",
    "/first-order-guide/",
    "/quality-packaging-export-readiness/",
  ];

  for (const path of routes) assert.ok(findRoute(path), `Expected ${path} to resolve to a site route.`);
  assert.equal(siteRoutes.guides.path, "/guides/");

  const sitemap = await readFile(new URL("../public/sitemap.xml", import.meta.url), "utf8");
  for (const path of routes) assert.match(sitemap, new RegExp(`https://zhonigolf\\.com${path}`.replaceAll("/", "\\/")), `Expected ${path} in sitemap.`);
});

test("indexes the custom golf caps product route in the sitemap", async () => {
  assert.equal(findRoute("/custom-golf-caps/"), siteRoutes.caps);
  const sitemap = await readFile(new URL("../public/sitemap.xml", import.meta.url), "utf8");
  assert.match(sitemap, /https:\/\/zhonigolf\.com\/custom-golf-caps\//);
});

test("connects every golf caps buyer guide to the product, solutions, process and inquiry routes", async () => {
  const app = await readFile(new URL("../src/App.jsx", import.meta.url), "utf8");
  const requiredLinks = ["/custom-golf-caps/", "/solutions/", "/our-process/", "/request-a-quote/"];
  for (const topic of ["capsStyle", "capsMaterials", "capsBranding"]) {
    const section = app.split(`  ${topic}: {`)[1].split("\n  },")[0];
    for (const href of requiredLinks) assert.match(section, new RegExp(href.replaceAll("/", "\\/")), `Expected ${topic} to link to ${href}.`);
  }
});

test("keeps golf caps visible in shared SEO paths and prefills the inquiry form", async () => {
  const [app, routes, robots] = await Promise.all([
    readFile(new URL("../src/App.jsx", import.meta.url), "utf8"),
    readFile(new URL("../src/siteRoutes.js", import.meta.url), "utf8"),
    readFile(new URL("../public/robots.txt", import.meta.url), "utf8"),
  ]);

  assert.match(routes, /caps and visors, towels, accessories, gift sets and packaging/);
  assert.match(app, /productAliases/);
  assert.match(app, /defaultValue=\{prefilledProduct\}/);
  assert.match(app, /Custom Golf Caps & Headwear/);
  assert.match(robots, /User-agent: \*\s+Allow: \/\s+\s*Sitemap: https:\/\/zhonigolf\.com\/sitemap\.xml/);
});

test("prerenders a self-canonical document for every public route", async () => {
  const template = await readFile(new URL("../index.html", import.meta.url), "utf8");

  for (const route of Object.values(siteRoutes)) {
    const document = renderRouteDocument(template, route);
    const canonical = `https://zhonigolf.com${route.path}`;
    assert.match(document, new RegExp(`<link rel="canonical" href="${canonical.replaceAll("/", "\\/")}"`));
    assert.match(document, new RegExp(`<title>${route.title.replaceAll("&", "&amp;")}<\\/title>`));
    assert.match(document, /<meta property="og:url" content="https:\/\/zhonigolf\.com/);
  }
});

test("publishes a complete first-round Korean locale with reciprocal SEO alternates", async () => {
  const template = await readFile(new URL("../index.html", import.meta.url), "utf8");
  const sitemap = await readFile(new URL("../public/sitemap.xml", import.meta.url), "utf8");
  const koreanRoutes = [siteRoutes.koHome, siteRoutes.koProducts, siteRoutes.koSolutions, siteRoutes.koProcess, siteRoutes.koFaq, siteRoutes.koAbout, siteRoutes.koQuote];

  for (const route of koreanRoutes) {
    assert.equal(findRoute(route.path), route);
    assert.equal(route.lang, "ko");
    assert.match(sitemap, new RegExp(`https://zhonigolf\\.com${route.path}`.replaceAll("/", "\\/")));
    const document = renderRouteDocument(template, route);
    assert.match(document, /<html lang="ko">/);
    assert.match(document, new RegExp(`<link rel="canonical" href="https://zhonigolf\\.com${route.path.replaceAll("/", "\\/")}"`));
    assert.match(document, new RegExp(`<link rel="alternate" hreflang="en" href="https://zhonigolf\\.com${route.alternatePath.replaceAll("/", "\\/")}"`));
    assert.match(document, new RegExp(`<link rel="alternate" hreflang="ko" href="https://zhonigolf\\.com${route.path.replaceAll("/", "\\/")}"`));
  }
});

test("keeps Korean navigation and inquiry conversion paths localized", async () => {
  const [site, locale] = await Promise.all([
    readFile(new URL("../src/KoreanSite.jsx", import.meta.url), "utf8"),
    readFile(new URL("../src/locale.jsx", import.meta.url), "utf8"),
  ]);
  for (const path of ["/ko/", "/ko/products/", "/ko/solutions/", "/ko/our-process/", "/ko/faq/", "/ko/about/", "/ko/request-a-quote/"]) {
    assert.match(site + locale, new RegExp(path.replaceAll("/", "\\/")));
  }
  assert.match(site, /<TurnstileField \/>/);
  assert.match(site, /VITE_INQUIRY_ENDPOINT/);
  assert.match(site, /page_language","ko"/);
});

test("publishes Korean product, solution and buyer-guide routes with reciprocal alternates", async () => {
  const template = await readFile(new URL("../index.html", import.meta.url), "utf8");
  const sitemap = await readFile(new URL("../public/sitemap.xml", import.meta.url), "utf8");
  const routeKeys = [
    "koHeadcovers", "koCaps", "koTowels", "koAccessories", "koPackaging",
    "koTournamentGifts", "koCorporateGifts", "koGuides",
    "koHeadcoversGuide", "koTowelsGuide", "koCapsStyleGuide", "koPackagingGuide",
  ];

  for (const key of routeKeys) {
    const route = siteRoutes[key];
    assert.equal(findRoute(route.path), route);
    assert.match(sitemap, new RegExp(`https://zhonigolf\\.com${route.path}`.replaceAll("/", "\\/")));
    const document = renderRouteDocument(template, route);
    assert.match(document, /<html lang="ko">/);
    assert.match(document, new RegExp(`<link rel="alternate" hreflang="en" href="https://zhonigolf\\.com${route.alternatePath.replaceAll("/", "\\/")}"`));
    assert.match(document, new RegExp(`<link rel="alternate" hreflang="ko" href="https://zhonigolf\\.com${route.path.replaceAll("/", "\\/")}"`));
  }
});

test("connects every first Korean guide to product, solutions, process and inquiry paths", async () => {
  const expansion = await readFile(new URL("../src/KoreanExpansion.jsx", import.meta.url), "utf8");
  for (const path of ["/ko/solutions/", "/ko/our-process/", "/ko/request-a-quote/"]) {
    assert.match(expansion, new RegExp(path.replaceAll("/", "\\/")));
  }
  for (const path of ["/ko/custom-golf-headcovers/", "/ko/custom-golf-caps/", "/ko/custom-golf-towels/", "/ko/custom-golf-packaging/"]) {
    assert.match(expansion, new RegExp(path.replaceAll("/", "\\/")));
  }
  assert.match(expansion, /MOQ/);
  assert.match(expansion, /샘플/);
  assert.match(expansion, /배송지/);
});

test("publishes Korean conversion and procurement routes with complete SEO alternates", async () => {
  const template = await readFile(new URL("../index.html", import.meta.url), "utf8");
  const sitemap = await readFile(new URL("../public/sitemap.xml", import.meta.url), "utf8");
  const keys = ["koGolfGifts", "koFirstOrder", "koExportReadiness", "koBrandingGuide", "koArtworkGuide", "koMoqGuide", "koQuoteFactorsGuide", "koQualityChecklistGuide", "koDeliveryDateGuide", "koPostBriefGuide"];
  for (const key of keys) {
    const route = siteRoutes[key];
    assert.equal(findRoute(route.path), route);
    assert.match(sitemap, new RegExp(`https://zhonigolf\\.com${route.path}`.replaceAll("/", "\\/")));
    const document = renderRouteDocument(template, route);
    assert.match(document, /<html lang="ko">/);
    assert.match(document, new RegExp(`hreflang="en" href="https://zhonigolf\\.com${route.alternatePath.replaceAll("/", "\\/")}"`));
    assert.match(document, new RegExp(`hreflang="ko" href="https://zhonigolf\\.com${route.path.replaceAll("/", "\\/")}"`));
  }
});

test("lists every published Korean procurement page in the Korean guide hub", async () => {
  const [hub, procurement] = await Promise.all([
    readFile(new URL("../src/KoreanExpansion.jsx", import.meta.url), "utf8"),
    readFile(new URL("../src/KoreanProcurement.jsx", import.meta.url), "utf8"),
  ]);
  const paths = [
    "/ko/custom-golf-gifts/", "/ko/first-order-guide/", "/ko/quality-packaging-export-readiness/",
    "/ko/guides/branding-methods-for-premium-golf-merchandise/", "/ko/guides/prepare-artwork-for-custom-golf-products/",
    "/ko/guides/custom-golf-merchandise-moq-explained/", "/ko/guides/what-affects-a-custom-golf-merchandise-quote/",
    "/ko/guides/custom-golf-merchandise-quality-checklist/", "/ko/guides/how-to-plan-a-golf-merchandise-delivery-date/",
    "/ko/guides/what-happens-after-a-custom-golf-project-brief/",
  ];
  for (const path of paths) assert.match(hub, new RegExp(path.replaceAll("/", "\\/")), `Expected ${path} in Korean guide hub.`);
  for (const required of ["/ko/products/", "/ko/solutions/", "/ko/our-process/", "/ko/request-a-quote/"]) assert.match(procurement, new RegExp(required.replaceAll("/", "\\/")));
});

test("keeps the completed Korean site in exact route parity with English", async () => {
  const template = await readFile(new URL("../index.html", import.meta.url), "utf8");
  const sitemap = await readFile(new URL("../public/sitemap.xml", import.meta.url), "utf8");
  const englishRoutes = Object.values(siteRoutes).filter(route => !route.lang);
  const koreanRoutes = Object.values(siteRoutes).filter(route => route.lang === "ko");
  assert.equal(englishRoutes.length, 49);
  assert.equal(koreanRoutes.length, englishRoutes.length);

  const koreanByEnglishPath = new Map(koreanRoutes.map(route => [route.alternatePath, route]));
  for (const englishRoute of englishRoutes) {
    const koreanRoute = koreanByEnglishPath.get(englishRoute.path);
    assert.ok(koreanRoute, `Missing Korean alternate for ${englishRoute.path}`);
    assert.equal(findRoute(koreanRoute.path), koreanRoute);
    assert.match(sitemap, new RegExp(`https://zhonigolf\\.com${koreanRoute.path}`.replaceAll("/", "\\/")));
    const englishDocument = renderRouteDocument(template, englishRoute);
    const koreanDocument = renderRouteDocument(template, koreanRoute);
    assert.match(englishDocument, new RegExp(`hreflang="ko" href="https://zhonigolf\\.com${koreanRoute.path.replaceAll("/", "\\/")}"`));
    assert.match(koreanDocument, new RegExp(`hreflang="en" href="https://zhonigolf\\.com${englishRoute.path.replaceAll("/", "\\/")}"`));
  }
});

test("lists every Korean buyer-guide article in the localized guide center", async () => {
  const guideHub = await readFile(new URL("../src/KoreanExpansion.jsx", import.meta.url), "utf8");
  const koreanGuides = Object.values(siteRoutes).filter(route => route.lang === "ko" && route.path.startsWith("/ko/guides/") && route.path !== "/ko/guides/");
  assert.ok(koreanGuides.length > 20);
  for (const route of koreanGuides) assert.match(guideHub, new RegExp(route.path.replaceAll("/", "\\/")), `Missing ${route.path} from Korean guide center.`);
});

test("loads the completed Korean content separately from the English entry bundle", async () => {
  const app = await readFile(new URL("../src/App.jsx", import.meta.url), "utf8");
  assert.match(app, /lazy\(\(\) => import\("\.\/KoreanSite\.jsx"\)/);
  assert.match(app, /<Suspense fallback=/);
});

test("tracks Korean quote CTAs with the same source attribution as English", async () => {
  const [app, seo, korean] = await Promise.all([
    readFile(new URL("../src/App.jsx", import.meta.url), "utf8"),
    readFile(new URL("../src/seo.js", import.meta.url), "utf8"),
    readFile(new URL("../src/KoreanSite.jsx", import.meta.url), "utf8"),
  ]);
  assert.match(app, /fr-ca.*request-a-quote/);
  assert.match(seo, /fr-ca.*request-a-quote/);
  assert.match(korean, /data\.set\("source",inquirySourceForLocation\(\)\)/);
});

test("publishes the first Canadian French locale round with localized SEO and conversion paths", async () => {
  const template = await readFile(new URL("../index.html", import.meta.url), "utf8");
  const sitemap = await readFile(new URL("../public/sitemap.xml", import.meta.url), "utf8");
  const frenchSite = await readFile(new URL("../src/CanadianFrenchSite.jsx", import.meta.url), "utf8");
  const locale = await readFile(new URL("../src/locale.jsx", import.meta.url), "utf8");
  const keys = ["frCaHome", "frCaProducts", "frCaSolutions", "frCaProcess", "frCaFaq", "frCaAbout", "frCaQuote"];

  for (const key of keys) {
    const route = siteRoutes[key];
    assert.equal(findRoute(route.path), route);
    assert.equal(route.lang, "fr-CA");
    assert.match(sitemap, new RegExp(`https://zhonigolf\\.com${route.path}`.replaceAll("/", "\\/")));
    const document = renderRouteDocument(template, route);
    assert.match(document, /<html lang="fr-CA">/);
    assert.match(document, new RegExp(`hreflang="en" href="https://zhonigolf\\.com${route.alternatePath.replaceAll("/", "\\/")}"`));
    assert.match(document, new RegExp(`hreflang="fr-CA" href="https://zhonigolf\\.com${route.path.replaceAll("/", "\\/")}"`));
  }

  for (const path of ["/fr-ca/products/", "/fr-ca/solutions/", "/fr-ca/our-process/", "/fr-ca/faq/", "/fr-ca/about/", "/fr-ca/request-a-quote/"]) {
    assert.match(frenchSite, new RegExp(path.replaceAll("/", "\\/")));
  }
  assert.match(frenchSite, /page_language","fr-CA"/);
  assert.match(frenchSite, /fr_ca_quote_page_project_brief/);
  assert.match(locale, /Français \(Canada\)/);
});

test("publishes Canadian French product and solution detail pages with reciprocal alternates", async () => {
  const template = await readFile(new URL("../index.html", import.meta.url), "utf8");
  const sitemap = await readFile(new URL("../public/sitemap.xml", import.meta.url), "utf8");
  const expansion = await readFile(new URL("../src/CanadianFrenchExpansion.jsx", import.meta.url), "utf8");
  const site = await readFile(new URL("../src/CanadianFrenchSite.jsx", import.meta.url), "utf8");
  const keys = ["frCaHeadcovers", "frCaCaps", "frCaTowels", "frCaAccessories", "frCaPackaging", "frCaTournamentGifts", "frCaCorporateGifts"];

  for (const key of keys) {
    const route = siteRoutes[key];
    assert.equal(findRoute(route.path), route);
    assert.match(sitemap, new RegExp(`https://zhonigolf\\.com${route.path}`.replaceAll("/", "\\/")));
    const document = renderRouteDocument(template, route);
    assert.match(document, /<html lang="fr-CA">/);
    assert.match(document, new RegExp(`hreflang="en" href="https://zhonigolf\\.com${route.alternatePath.replaceAll("/", "\\/")}"`));
    assert.match(document, new RegExp(`hreflang="fr-CA" href="https://zhonigolf\\.com${route.path.replaceAll("/", "\\/")}"`));
  }

  for (const path of ["/fr-ca/products/", "/fr-ca/solutions/", "/fr-ca/our-process/", "/fr-ca/request-a-quote/"]) {
    assert.match(expansion, new RegExp(path.replaceAll("/", "\\/")));
  }
  for (const key of keys) assert.match(site + expansion, new RegExp(siteRoutes[key].path.replaceAll("/", "\\/")));
  assert.match(expansion, /encodeURIComponent\(c\.brief\)/);
  assert.match(expansion, /Quantité/);
  assert.match(expansion, /destination/i);
});

test("keeps inquiry contact details beneath the form action and prevents compact contact layout", async () => {
  const [app, styles, pageStyles] = await Promise.all([
    readFile(new URL("../src/App.jsx", import.meta.url), "utf8"),
    readFile(new URL("../src/styles.css", import.meta.url), "utf8"),
    readFile(new URL("../src/zhoni-pages.css", import.meta.url), "utf8"),
  ]);

  assert.match(app, /<span>EMAIL<\/span><strong>sales@zhonigolf\.com<\/strong>/);
  assert.match(app, /<span>WHATSAPP<\/span><strong>\+86 177 5919 0848<\/strong>/);
  assert.match(styles, /\.quote form>\.inquiry-submit-contact\{grid-column:1\/-1/);
  assert.match(pageStyles, /\.quote-ledger-form \.inquiry-submit-contact\{grid-column:1\/-1/);
  assert.match(pageStyles, /\.after-inquiry-actions strong\{[^}]*white-space:nowrap/);
  assert.match(pageStyles, /\.quote-entity-contact a\{[^}]*white-space:nowrap/);
});

test("uses distinct product-specific images for every products hub family", async () => {
  const app = await readFile(new URL("../src/App.jsx", import.meta.url), "utf8");
  const assets = [
    "zhoni-product-headcovers-v3.png",
    "zhoni-product-caps-v3.png",
    "zhoni-product-magnetic-towel-v4.png",
    "zhoni-product-accessories-v3.png",
    "zhoni-product-ball-markers-v3.png",
    "zhoni-product-gift-sets-v3.png",
    "zhoni-product-packaging-v3.png",
  ];

  for (const asset of assets) {
    const path = new URL(`../public/assets/images/${asset}`, import.meta.url);
    await access(path);
    assert.match(app, new RegExp(asset.replaceAll(".", "\\.")));
  }
});

test("keeps product-family imagery large in a responsive three-to-one column grid", async () => {
  const styles = await readFile(new URL("../src/products.css", import.meta.url), "utf8");
  assert.match(styles, /\.family-grid\s*\{\s*display:\s*grid;\s*grid-template-columns:\s*repeat\(3, minmax\(0, 1fr\)\)/);
  assert.match(styles, /\.family-card img\s*\{\s*width:\s*100%;\s*aspect-ratio:\s*4 \/ 5/);
  assert.match(styles, /@media \(max-width: 1080px\)[\s\S]*?\.family-grid\s*\{\s*grid-template-columns:\s*repeat\(2, minmax\(0, 1fr\)\)/);
  assert.match(styles, /@media \(max-width: 560px\)[\s\S]*?\.family-grid\s*\{\s*grid-template-columns:\s*1fr/);
});

test("emits the files required by Sites packaging", async () => {
  await access(new URL("../dist/client/index.html", import.meta.url));
  await access(new URL("../dist/server/index.js", import.meta.url));
  await access(new URL("../dist/.openai/hosting.json", import.meta.url));
});
