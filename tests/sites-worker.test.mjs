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

test("publishes the first Japanese locale round with localized SEO and conversion paths", async () => {
  const [sitemap, app, locale, japanese] = await Promise.all([
    readFile(new URL("../public/sitemap.xml", import.meta.url), "utf8"),
    readFile(new URL("../src/App.jsx", import.meta.url), "utf8"),
    readFile(new URL("../src/locale.jsx", import.meta.url), "utf8"),
    readFile(new URL("../src/JapaneseSite.jsx", import.meta.url), "utf8"),
  ]);
  const routes = [siteRoutes.jaHome, siteRoutes.jaProducts, siteRoutes.jaSolutions, siteRoutes.jaProcess, siteRoutes.jaFaq, siteRoutes.jaAbout, siteRoutes.jaQuote];
  for (const route of routes) {
    assert.equal(findRoute(route.path), route);
    assert.equal(route.lang, "ja");
    assert.match(sitemap, new RegExp(`https://zhonigolf\\.com${route.path}`.replaceAll("/", "\\/")));
    const document = await readFile(new URL(`../dist/client/${route.path.slice(1)}index.html`, import.meta.url), "utf8");
    assert.match(document, /<html lang="ja">/);
    assert.match(document, new RegExp(`<link rel="alternate" hreflang="en" href="https://zhonigolf\\.com${route.alternatePath.replaceAll("/", "\\/")}"`));
    assert.match(document, new RegExp(`<link rel="alternate" hreflang="ja" href="https://zhonigolf\\.com${route.path.replaceAll("/", "\\/")}"`));
    assert.match(document, /<h1(?:\s|>)/);
  }
  for (const path of ["/ja/", "/ja/products/", "/ja/solutions/", "/ja/our-process/", "/ja/faq/", "/ja/about/", "/ja/request-a-quote/"]) assert.match(japanese + locale, new RegExp(path.replaceAll("/", "\\/")));
  assert.match(locale, /日本語/);
  assert.match(app, /lazy\(\(\) => import\("\.\/JapaneseSite\.jsx"\)/);
  assert.match(app, /FloatingContactActions locale="ja"/);
  assert.match(japanese, /page_language", "ja"/);
  assert.match(japanese, /<TurnstileField \/>/);
  assert.match(japanese, /data\.set\("source", inquirySourceForLocation\(\)\)/);
});

test("publishes Japanese product and solution detail pages with complete buyer paths", async () => {
  const [sitemap, japanese, expansion] = await Promise.all([
    readFile(new URL("../public/sitemap.xml", import.meta.url), "utf8"),
    readFile(new URL("../src/JapaneseSite.jsx", import.meta.url), "utf8"),
    readFile(new URL("../src/JapaneseExpansion.jsx", import.meta.url), "utf8"),
  ]);
  const productKeys = ["jaHeadcovers", "jaCaps", "jaTowels", "jaAccessories", "jaPackaging"];
  const solutionKeys = ["jaTournamentGifts", "jaCorporateGifts", "jaClubMemberPrograms", "jaPrivateLabelCollections"];

  for (const key of [...productKeys, ...solutionKeys]) {
    const route = siteRoutes[key];
    assert.equal(findRoute(route.path), route);
    assert.equal(route.lang, "ja");
    assert.match(sitemap, new RegExp(`https://zhonigolf\\.com${route.path}`.replaceAll("/", "\\/")));
    const document = await readFile(new URL(`../dist/client/${route.path.slice(1)}index.html`, import.meta.url), "utf8");
    assert.match(document, /<html lang="ja">/);
    assert.match(document, /<h1(?:\s|>)/);
    assert.match(document, new RegExp(`hreflang="en" href="https://zhonigolf\\.com${route.alternatePath.replaceAll("/", "\\/")}"`));
    assert.match(document, new RegExp(`hreflang="ja" href="https://zhonigolf\\.com${route.path.replaceAll("/", "\\/")}"`));
    assert.match(document, /data-buyer-evidence="ja-/);
    for (const path of ["/ja/products/", "/ja/solutions/", "/ja/our-process/", "/ja/request-a-quote/"]) {
      assert.match(document, new RegExp(path.replaceAll("/", "\\/")), `Expected ${path} on ${route.path}.`);
    }
    const schemaMatch = document.match(/<script id="zhoni-page-schema" type="application\/ld\+json">([\s\S]*?)<\/script>/);
    const graph = JSON.parse(schemaMatch[1])["@graph"];
    assert.ok(graph.some((entity) => entity["@type"] === "Service"));
    if (solutionKeys.includes(key)) assert.ok(graph.some((entity) => entity["@type"] === "FAQPage"));
  }

  const solutionsHub = await readFile(new URL("../dist/client/ja/solutions/index.html", import.meta.url), "utf8");
  for (const key of productKeys) assert.match(japanese, new RegExp(siteRoutes[key].path.replaceAll("/", "\\/")));
  for (const key of solutionKeys) {
    const route = siteRoutes[key];
    assert.match(solutionsHub, new RegExp(route.path.replaceAll("/", "\\/")));
    const document = await readFile(new URL(`../dist/client/${route.path.slice(1)}index.html`, import.meta.url), "utf8");
    assert.match(document, /solution=(?:golf-tournament-gifts|corporate-golf-gifts|club-member-programs|private-label-collections)&amp;source=/);
  }
  assert.match(expansion, /購入担当者チェックリスト/);
  assert.match(expansion, /購入担当者からのよくある質問/);
});

test("publishes the first Japanese buyer-guide collection with filters and project links", async () => {
  const [sitemap, site, expansion] = await Promise.all([
    readFile(new URL("../public/sitemap.xml", import.meta.url), "utf8"),
    readFile(new URL("../src/JapaneseSite.jsx", import.meta.url), "utf8"),
    readFile(new URL("../src/JapaneseExpansion.jsx", import.meta.url), "utf8"),
  ]);
  const keys = ["jaGuides", "jaHeadcoversGuide", "jaTowelsGuide", "jaCapsStyleGuide", "jaPackagingGuide"];
  const productPaths = {
    jaHeadcoversGuide: "/ja/custom-golf-headcovers/",
    jaTowelsGuide: "/ja/custom-golf-towels/",
    jaCapsStyleGuide: "/ja/custom-golf-caps/",
    jaPackagingGuide: "/ja/custom-golf-packaging/",
  };

  for (const key of keys) {
    const route = siteRoutes[key];
    assert.equal(findRoute(route.path), route);
    assert.equal(route.lang, "ja");
    assert.match(sitemap, new RegExp(`https://zhonigolf\\.com${route.path}`.replaceAll("/", "\\/")));
    const document = await readFile(new URL(`../dist/client/${route.path.slice(1)}index.html`, import.meta.url), "utf8");
    assert.match(document, /<html lang="ja">/);
    assert.match(document, /<h1(?:\s|>)/);
    assert.match(document, new RegExp(`hreflang="en" href="https://zhonigolf\\.com${route.alternatePath.replaceAll("/", "\\/")}"`));
    assert.match(document, new RegExp(`hreflang="ja" href="https://zhonigolf\\.com${route.path.replaceAll("/", "\\/")}"`));
    assert.match(document, /data-buyer-evidence="ja-/);

    if (key !== "jaGuides") {
      for (const path of [productPaths[key], "/ja/solutions/", "/ja/our-process/", "/ja/request-a-quote/"]) {
        assert.match(document, new RegExp(path.replaceAll("/", "\\/")), `Expected ${path} on ${route.path}.`);
      }
      assert.match(document, /購入担当者からのよくある質問/);
      assert.match(document, /\?product=/);
      const schemaMatch = document.match(/<script id="zhoni-page-schema" type="application\/ld\+json">([\s\S]*?)<\/script>/);
      const graph = JSON.parse(schemaMatch[1])["@graph"];
      assert.ok(graph.some((entity) => entity["@type"] === "Article"));
      assert.ok(graph.some((entity) => entity["@type"] === "FAQPage"));
    }
  }

  const hub = await readFile(new URL("../dist/client/ja/guides/index.html", import.meta.url), "utf8");
  for (const key of keys.slice(1)) assert.match(hub, new RegExp(siteRoutes[key].path.replaceAll("/", "\\/")));
  assert.match(hub, /購入ガイドの絞り込み/);
  assert.match(hub, /製品・カスタマイズ/);
  assert.match(hub, /品質・納品/);
  assert.match(site + expansion, /\/ja\/guides\//);
});

test("publishes Japanese procurement and first-order guides with complete conversion paths", async () => {
  const [sitemap, expansion, procurement] = await Promise.all([
    readFile(new URL("../public/sitemap.xml", import.meta.url), "utf8"),
    readFile(new URL("../src/JapaneseExpansion.jsx", import.meta.url), "utf8"),
    readFile(new URL("../src/JapaneseProcurement.jsx", import.meta.url), "utf8"),
  ]);
  const hubKeys = ["jaGolfGifts", "jaFirstOrder", "jaExportReadiness"];
  const guideKeys = ["jaBrandingGuide", "jaArtworkGuide", "jaMoqGuide", "jaQuoteFactorsGuide", "jaQualityChecklistGuide", "jaDeliveryDateGuide", "jaPostBriefGuide"];

  for (const key of [...hubKeys, ...guideKeys]) {
    const route = siteRoutes[key];
    assert.equal(findRoute(route.path), route);
    assert.equal(route.lang, "ja");
    assert.match(sitemap, new RegExp(`https://zhonigolf\\.com${route.path}`.replaceAll("/", "\\/")));
    const document = await readFile(new URL(`../dist/client/${route.path.slice(1)}index.html`, import.meta.url), "utf8");
    assert.match(document, /<html lang="ja">/);
    assert.match(document, /<h1(?:\s|>)/);
    assert.match(document, new RegExp(`hreflang="en" href="https://zhonigolf\\.com${route.alternatePath.replaceAll("/", "\\/")}"`));
    assert.match(document, new RegExp(`hreflang="ja" href="https://zhonigolf\\.com${route.path.replaceAll("/", "\\/")}"`));
    assert.match(document, /data-buyer-evidence="ja-/);
    for (const path of ["/ja/products/", "/ja/solutions/", "/ja/our-process/", "/ja/request-a-quote/"]) {
      assert.match(document, new RegExp(path.replaceAll("/", "\\/")), `Expected ${path} on ${route.path}.`);
    }
    const schemaMatch = document.match(/<script id="zhoni-page-schema" type="application\/ld\+json">([\s\S]*?)<\/script>/);
    const graph = JSON.parse(schemaMatch[1])["@graph"];
    if (key === "jaGolfGifts") assert.ok(graph.some((entity) => entity["@type"] === "CollectionPage"));
    else assert.ok(graph.some((entity) => entity["@type"] === "Article"));
    if (guideKeys.includes(key)) assert.ok(graph.some((entity) => entity["@type"] === "FAQPage"));
  }

  const guideHub = await readFile(new URL("../dist/client/ja/guides/index.html", import.meta.url), "utf8");
  for (const key of [...hubKeys, ...guideKeys]) assert.match(guideHub, new RegExp(siteRoutes[key].path.replaceAll("/", "\\/")), `Missing ${siteRoutes[key].path} from Japanese guide center.`);
  for (const label of ["製品・カスタマイズ", "ギフト・イベント", "MOQ・初回注文", "品質・納品"]) assert.match(guideHub, new RegExp(label));
  assert.match(expansion, /<JapaneseProcurement routeKey=\{routeKey\}/);
  assert.match(procurement, /同じ基準で比較できるブリーフ/);
});

test("publishes the Japanese product-development guide cluster", async () => {
  const [sitemap, hub, procurement, finalGuides] = await Promise.all([
    readFile(new URL("../public/sitemap.xml", import.meta.url), "utf8"),
    readFile(new URL("../dist/client/ja/guides/index.html", import.meta.url), "utf8"),
    readFile(new URL("../src/JapaneseProcurement.jsx", import.meta.url), "utf8"),
    readFile(new URL("../src/JapaneseFinalGuides.jsx", import.meta.url), "utf8"),
  ]);
  const keys = [
    "jaHeadcoverMaterialsGuide", "jaHeadcoverTypesGuide", "jaProductSpecificationGuide",
    "jaSampleApprovalGuide", "jaCollectionPlanningGuide", "jaHeadcoverLogoGuide",
    "jaCapsMaterialsGuide", "jaCapsBrandingGuide", "jaProductDevelopmentBriefGuide",
  ];

  for (const key of keys) {
    const route = siteRoutes[key];
    assert.equal(findRoute(route.path), route);
    assert.equal(route.lang, "ja");
    assert.match(sitemap, new RegExp(`https://zhonigolf\\.com${route.path}`.replaceAll("/", "\\/")));
    assert.match(hub, new RegExp(route.path.replaceAll("/", "\\/")), `Missing ${route.path} from Japanese guide center.`);
    const document = await readFile(new URL(`../dist/client/${route.path.slice(1)}index.html`, import.meta.url), "utf8");
    assert.match(document, /<html lang="ja">/);
    assert.match(document, /<h1(?:\s|>)/);
    assert.match(document, new RegExp(`hreflang="en" href="https://zhonigolf\\.com${route.alternatePath.replaceAll("/", "\\/")}"`));
    assert.match(document, new RegExp(`hreflang="ja" href="https://zhonigolf\\.com${route.path.replaceAll("/", "\\/")}"`));
    assert.match(document, /data-buyer-evidence="ja-development-/);
    assert.match(document, /よくある質問/);
    for (const path of ["/ja/products/", "/ja/solutions/", "/ja/our-process/", "/ja/request-a-quote/"]) {
      assert.match(document, new RegExp(path.replaceAll("/", "\\/")), `Expected ${path} on ${route.path}.`);
    }
    const schemaMatch = document.match(/<script id="zhoni-page-schema" type="application\/ld\+json">([\s\S]*?)<\/script>/);
    const graph = JSON.parse(schemaMatch[1])["@graph"];
    assert.ok(graph.some((entity) => entity["@type"] === "Article"));
    assert.ok(graph.some((entity) => entity["@type"] === "FAQPage"));
  }

  assert.match(procurement, /<JapaneseFinalGuides routeKey=\{routeKey\}/);
  assert.match(finalGuides, /製品開発ブリーフには/);
  assert.match(finalGuides, /サンプル承認は/);
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
    "koTournamentGifts", "koCorporateGifts", "koClubMemberPrograms", "koPrivateLabelCollections", "koGuides",
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

test("keeps the completed Korean routes in full parity with English", async () => {
  const template = await readFile(new URL("../index.html", import.meta.url), "utf8");
  const sitemap = await readFile(new URL("../public/sitemap.xml", import.meta.url), "utf8");
  const englishRoutes = Object.values(siteRoutes).filter(route => !route.lang);
  const koreanRoutes = Object.values(siteRoutes).filter(route => route.lang === "ko");
  assert.equal(englishRoutes.length, 51);
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
  const keys = ["frCaHeadcovers", "frCaCaps", "frCaTowels", "frCaAccessories", "frCaPackaging", "frCaTournamentGifts", "frCaCorporateGifts", "frCaClubMemberPrograms", "frCaPrivateLabelCollections"];

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

test("publishes the first Canadian French buyer-guide collection with filters and complete project links", async () => {
  const template = await readFile(new URL("../index.html", import.meta.url), "utf8");
  const sitemap = await readFile(new URL("../public/sitemap.xml", import.meta.url), "utf8");
  const expansion = await readFile(new URL("../src/CanadianFrenchExpansion.jsx", import.meta.url), "utf8");
  const styles = await readFile(new URL("../src/canadian-french.css", import.meta.url), "utf8");
  const keys = ["frCaGuides", "frCaHeadcoversGuide", "frCaTowelsGuide", "frCaCapsStyleGuide", "frCaPackagingGuide"];

  for (const key of keys) {
    const route = siteRoutes[key];
    assert.equal(findRoute(route.path), route);
    assert.match(sitemap, new RegExp(`https://zhonigolf\\.com${route.path}`.replaceAll("/", "\\/")));
    assert.match(expansion, new RegExp(route.path.replaceAll("/", "\\/")));
    const document = renderRouteDocument(template, route);
    assert.match(document, /<html lang="fr-CA">/);
    assert.match(document, new RegExp(`hreflang="en" href="https://zhonigolf\\.com${route.alternatePath.replaceAll("/", "\\/")}"`));
    assert.match(document, new RegExp(`hreflang="fr-CA" href="https://zhonigolf\\.com${route.path.replaceAll("/", "\\/")}"`));
  }

  for (const path of ["/fr-ca/products/", "/fr-ca/solutions/", "/fr-ca/our-process/", "/fr-ca/request-a-quote/"]) {
    assert.match(expansion, new RegExp(path.replaceAll("/", "\\/")));
  }
  for (const label of ["TOUS LES GUIDES", "PRODUITS ET MARQUAGE", "CADEAUX ET ÉVÉNEMENTS", "MOQ ET PREMIÈRE COMMANDE", "QUALITÉ ET LIVRAISON"]) assert.match(expansion, new RegExp(label));
  assert.match(expansion, /guide\.group===filter/);
  assert.match(styles, /\.fr-ca-page \.guide-catalog/);
});

test("publishes Canadian French procurement and conversion guides with complete project paths", async () => {
  const template = await readFile(new URL("../index.html", import.meta.url), "utf8");
  const sitemap = await readFile(new URL("../public/sitemap.xml", import.meta.url), "utf8");
  const hub = await readFile(new URL("../src/CanadianFrenchExpansion.jsx", import.meta.url), "utf8");
  const procurement = await readFile(new URL("../src/CanadianFrenchProcurement.jsx", import.meta.url), "utf8");
  const keys = ["frCaGolfGifts", "frCaFirstOrder", "frCaExportReadiness", "frCaBrandingGuide", "frCaArtworkGuide", "frCaMoqGuide", "frCaQuoteFactorsGuide", "frCaQualityChecklistGuide", "frCaDeliveryDateGuide", "frCaPostBriefGuide"];

  for (const key of keys) {
    const route = siteRoutes[key];
    assert.equal(findRoute(route.path), route);
    assert.match(sitemap, new RegExp(`https://zhonigolf\\.com${route.path}`.replaceAll("/", "\\/")));
    assert.match(hub, new RegExp(route.path.replaceAll("/", "\\/")), `Expected ${route.path} in French guide center.`);
    const document = renderRouteDocument(template, route);
    assert.match(document, /<html lang="fr-CA">/);
    assert.match(document, new RegExp(`hreflang="en" href="https://zhonigolf\\.com${route.alternatePath.replaceAll("/", "\\/")}"`));
    assert.match(document, new RegExp(`hreflang="fr-CA" href="https://zhonigolf\\.com${route.path.replaceAll("/", "\\/")}"`));
  }

  for (const path of ["/fr-ca/products/", "/fr-ca/solutions/", "/fr-ca/our-process/", "/fr-ca/request-a-quote/"]) {
    assert.match(procurement, new RegExp(path.replaceAll("/", "\\/")));
  }
  for (const required of ["Quantité", "Échantillon", "Emballage", "Destination", "QUESTIONS FRÉQUENTES"]) assert.match(procurement, new RegExp(required, "i"));
});

test("publishes Canadian French product-development and event-planning guide clusters", async () => {
  const template = await readFile(new URL("../index.html", import.meta.url), "utf8");
  const sitemap = await readFile(new URL("../public/sitemap.xml", import.meta.url), "utf8");
  const hub = await readFile(new URL("../src/CanadianFrenchExpansion.jsx", import.meta.url), "utf8");
  const articles = await readFile(new URL("../src/CanadianFrenchFinalGuides.jsx", import.meta.url), "utf8");
  const keys = [
    "frCaGolfGiftGuide", "frCaAudienceGiftGuide", "frCaTournamentGuide", "frCaCorporateGuide",
    "frCaHeadcoverMaterialsGuide", "frCaHeadcoverTypesGuide", "frCaProductSpecificationGuide",
    "frCaSampleApprovalGuide", "frCaCollectionPlanningGuide", "frCaHeadcoverLogoGuide",
    "frCaCapsMaterialsGuide", "frCaCapsBrandingGuide", "frCaProductDevelopmentBriefGuide",
    "frCaTournamentGiftBudgetGuide", "frCaPlayerPackGuide", "frCaRecipientRolesGuide",
    "frCaPremiumGiftSetGuide", "frCaEventBriefGuide",
  ];

  for (const key of keys) {
    const route = siteRoutes[key];
    assert.equal(findRoute(route.path), route);
    assert.match(sitemap, new RegExp(`https://zhonigolf\\.com${route.path}`.replaceAll("/", "\\/")));
    assert.match(hub, new RegExp(route.path.replaceAll("/", "\\/")), `Expected ${route.path} in French guide center.`);
    const document = renderRouteDocument(template, route);
    assert.match(document, /<html lang="fr-CA">/);
    assert.match(document, new RegExp(`hreflang="en" href="https://zhonigolf\\.com${route.alternatePath.replaceAll("/", "\\/")}"`));
    assert.match(document, new RegExp(`hreflang="fr-CA" href="https://zhonigolf\\.com${route.path.replaceAll("/", "\\/")}"`));
  }

  for (const path of ["/fr-ca/products/", "/fr-ca/solutions/", "/fr-ca/our-process/", "/fr-ca/request-a-quote/"]) {
    assert.match(articles, new RegExp(path.replaceAll("/", "\\/")));
  }
  for (const required of ["rows.map", "checklist.map", "questions.map", "POINT À DÉFINIR", "LISTE DE CONTRÔLE"]) assert.match(articles, new RegExp(required.replaceAll(".", "\\.")));
});

test("keeps completed Canadian French routes in full parity with English", async () => {
  const template = await readFile(new URL("../index.html", import.meta.url), "utf8");
  const sitemap = await readFile(new URL("../public/sitemap.xml", import.meta.url), "utf8");
  const hub = await readFile(new URL("../src/CanadianFrenchExpansion.jsx", import.meta.url), "utf8");
  const finalPages = await readFile(new URL("../src/CanadianFrenchFinalGuides.jsx", import.meta.url), "utf8");
  const englishRoutes = Object.values(siteRoutes).filter((route) => !route.lang);
  const frenchRoutes = Object.values(siteRoutes).filter((route) => route.lang === "fr-CA");
  const frenchByEnglishPath = new Map(frenchRoutes.map((route) => [route.alternatePath, route]));

  assert.equal(englishRoutes.length, 51);
  assert.equal(frenchRoutes.length, englishRoutes.length);

  for (const englishRoute of englishRoutes) {
    const frenchRoute = frenchByEnglishPath.get(englishRoute.path);
    assert.ok(frenchRoute, `Expected a Canadian French route for ${englishRoute.path}.`);
    assert.equal(findRoute(frenchRoute.path), frenchRoute);
    assert.match(sitemap, new RegExp(`https://zhonigolf\\.com${frenchRoute.path}`.replaceAll("/", "\\/")));

    const englishDocument = renderRouteDocument(template, englishRoute);
    const frenchDocument = renderRouteDocument(template, frenchRoute);
    assert.match(englishDocument, new RegExp(`hreflang="fr-CA" href="https://zhonigolf\\.com${frenchRoute.path.replaceAll("/", "\\/")}"`));
    assert.match(frenchDocument, new RegExp(`hreflang="en" href="https://zhonigolf\\.com${englishRoute.path.replaceAll("/", "\\/")}"`));
    assert.match(frenchDocument, /<html lang="fr-CA">/);
  }

  const frenchGuideArticles = frenchRoutes.filter((route) => route.path.startsWith("/fr-ca/guides/") && route.path !== "/fr-ca/guides/");
  for (const route of frenchGuideArticles) {
    assert.match(hub, new RegExp(route.path.replaceAll("/", "\\/")), `Expected ${route.path} in the French guide center.`);
  }

  for (const path of ["/fr-ca/products/", "/fr-ca/solutions/", "/fr-ca/our-process/", "/fr-ca/request-a-quote/"]) {
    assert.match(finalPages, new RegExp(path.replaceAll("/", "\\/")));
  }
  for (const required of ["Orientation produit", "Application de la marque", "Contrôle de la qualité", "Préparation à l'exportation"]) {
    assert.match(finalPages, new RegExp(required));
  }
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

test("prerenders complete semantic page content for every locale route", async () => {
  for (const route of Object.values(siteRoutes)) {
    const relativePath = route.path === "/" ? "../dist/client/index.html" : `../dist/client/${route.path.slice(1)}index.html`;
    const document = await readFile(new URL(relativePath, import.meta.url), "utf8");
    assert.doesNotMatch(document, /<div id="root"><\/div>/, `Expected rendered content for ${route.path}.`);
    assert.match(document, /<main(?:\s|>)/, `Expected semantic main content for ${route.path}.`);
    assert.match(document, /<h1(?:\s|>)/, `Expected a rendered H1 for ${route.path}.`);
  }

  const [englishFaq, koreanFaq, frenchFaq] = await Promise.all([
    readFile(new URL("../dist/client/faq/index.html", import.meta.url), "utf8"),
    readFile(new URL("../dist/client/ko/faq/index.html", import.meta.url), "utf8"),
    readFile(new URL("../dist/client/fr-ca/faq/index.html", import.meta.url), "utf8"),
  ]);
  assert.match(englishFaq, /What is the best next step\?/);
  assert.match(englishFaq, /Share the occasion, recipients, product direction/);
  assert.match(koreanFaq, /여러 제품을 하나의 기프트 세트로 구성할 수 있나요\?/);
  assert.match(frenchFaq, /Pouvez-vous créer un ensemble-cadeau complet\?/);
});

test("prerenders valid localized structured data for every route", async () => {
  const schemas = new Map();
  const englishArticlePaths = new Set(
    Object.values(siteRoutes)
      .filter((route) => !route.lang && ((route.path.startsWith("/guides/") && route.path !== "/guides/") || ["/first-order-guide/", "/quality-packaging-export-readiness/"].includes(route.path)))
      .map((route) => route.path),
  );

  for (const route of Object.values(siteRoutes)) {
    const relativePath = route.path === "/" ? "../dist/client/index.html" : `../dist/client/${route.path.slice(1)}index.html`;
    const document = await readFile(new URL(relativePath, import.meta.url), "utf8");
    const matches = [...document.matchAll(/<script id="zhoni-page-schema" type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
    assert.equal(matches.length, 1, `Expected exactly one JSON-LD graph for ${route.path}.`);
    assert.ok(matches[0].index < document.indexOf("</head>"), `Expected JSON-LD in the document head for ${route.path}.`);
    const schema = JSON.parse(matches[0][1]);
    const graph = schema["@graph"];
    const types = graph.map((entity) => entity["@type"]);
    for (const requiredType of ["Organization", "Brand", "WebSite", "WebPage"]) {
      assert.ok(types.includes(requiredType), `Expected ${requiredType} schema for ${route.path}.`);
    }
    assert.equal(graph.find((entity) => entity["@type"] === "WebPage").inLanguage, route.lang ?? "en");
    assert.equal(types.includes("BreadcrumbList"), route.path !== "/", `Unexpected breadcrumb state for ${route.path}.`);

    const englishPath = route.lang ? route.alternatePath : route.path;
    assert.equal(types.includes("Article"), englishArticlePaths.has(englishPath), `Unexpected Article schema state for ${route.path}.`);
    schemas.set(route.path, { document, graph });
  }

  for (const [path, expectedCount, firstQuestion] of [
    ["/faq/", 15, "What custom golf products can be discussed?"],
    ["/ko/faq/", 6, "어떤 골프용품을 맞춤 제작할 수 있나요?"],
    ["/fr-ca/faq/", 6, "Quels produits de golf peuvent être personnalisés?"],
    ["/ja/faq/", 6, "どのようなゴルフ用品をカスタムできますか？"],
    ["/guides/custom-golf-headcover-materials/", 3, "Is one material always more premium?"],
  ]) {
    const { document, graph } = schemas.get(path);
    const faq = graph.find((entity) => entity["@type"] === "FAQPage");
    assert.equal(faq.mainEntity.length, expectedCount, `Unexpected FAQ question count for ${path}.`);
    assert.equal(faq.mainEntity[0].name, firstQuestion);
    for (const entity of faq.mainEntity) {
      assert.ok(document.includes(entity.name), `FAQ question is not visible in ${path}: ${entity.name}`);
      assert.ok(document.includes(entity.acceptedAnswer.text), `FAQ answer is not visible in ${path}: ${entity.name}`);
    }
  }

  const koreanBreadcrumb = schemas.get("/ko/guides/custom-golf-headcover-materials/").graph.find((entity) => entity["@type"] === "BreadcrumbList");
  assert.deepEqual(koreanBreadcrumb.itemListElement.slice(0, 2).map((item) => item.name), ["홈", "구매 가이드"]);
  const frenchBreadcrumb = schemas.get("/fr-ca/guides/custom-golf-headcover-materials/").graph.find((entity) => entity["@type"] === "BreadcrumbList");
  assert.deepEqual(frenchBreadcrumb.itemListElement.slice(0, 2).map((item) => item.name), ["Accueil", "Guides d'achat"]);

  for (const path of ["/guides/", "/ko/guides/", "/fr-ca/guides/", "/custom-golf-gifts/", "/ko/custom-golf-gifts/", "/fr-ca/custom-golf-gifts/"]) {
    assert.ok(schemas.get(path).graph.some((entity) => entity["@type"] === "CollectionPage"), `Expected CollectionPage schema for ${path}.`);
  }
});

test("adds a transparent buyer evidence layer to English procurement routes", async () => {
  const evidenceRoutes = new Map([
    ["/products/", "products"],
    ["/custom-golf-headcovers/", "product-headcovers"],
    ["/custom-golf-caps/", "product-caps"],
    ["/custom-golf-towels/", "product-towels"],
    ["/custom-golf-accessories/", "product-accessories"],
    ["/custom-golf-packaging/", "product-packaging"],
    ["/solutions/", "solutions"],
    ["/custom-golf-gifts/", "custom-golf-gifts"],
    ["/solutions/corporate-golf-gifts/", "corporate-gifts"],
    ["/solutions/golf-tournament-gifts/", "tournament-gifts"],
    ["/solutions/golf-club-member-programs/", "club-member-programs"],
    ["/solutions/private-label-golf-collections/", "private-label-collections"],
    ["/our-process/", "process"],
    ["/request-a-quote/", "inquiry"],
  ]);

  for (const [path, context] of evidenceRoutes) {
    const document = await readFile(new URL(`../dist/client/${path.slice(1)}index.html`, import.meta.url), "utf8");
    assert.match(document, new RegExp(`data-buyer-evidence="${context}"`), `Expected buyer evidence on ${path}.`);
    for (const required of ["Written scope", "Approval trail", "Quality checkpoints", "Packing &amp; hand-off", "DOCUMENTATION BOUNDARY"]) {
      assert.match(document, new RegExp(required), `Expected ${required} on ${path}.`);
    }
    assert.match(document, /this section is not a claim of universal certification/i);
  }

  const home = await readFile(new URL("../dist/client/index.html", import.meta.url), "utf8");
  assert.match(home, /PROJECT DIRECTION IN PRACTICE/);
  assert.match(home, /These representative visuals illustrate/);
  assert.doesNotMatch(home, /PROJECT EVIDENCE|Delivered in the real world/);

  const styles = await readFile(new URL("../src/zhoni-pages.css", import.meta.url), "utf8");
  assert.match(styles, /\.buyer-evidence-grid\{display:grid;grid-template-columns:repeat\(4,minmax\(0,1fr\)\)/);
  assert.match(styles, /@media\(max-width:560px\)[\s\S]*?\.buyer-evidence-grid\{grid-template-columns:1fr/);
});

test("publishes complete club-member and private-label solution pages", async () => {
  const [sitemap, app, llms] = await Promise.all([
    readFile(new URL("../public/sitemap.xml", import.meta.url), "utf8"),
    readFile(new URL("../src/App.jsx", import.meta.url), "utf8"),
    readFile(new URL("../public/llms.txt", import.meta.url), "utf8"),
  ]);
  const cases = [
    {
      route: siteRoutes.clubMemberPrograms,
      heading: "Custom golf merchandise",
      marker: "club-member-programs",
      question: "Can one merchandise program support several member moments?",
    },
    {
      route: siteRoutes.privateLabelCollections,
      heading: "A private-label golf",
      marker: "private-label-collections",
      question: "Can a private-label range start with one hero product?",
    },
  ];

  for (const { route, heading, marker, question } of cases) {
    assert.equal(findRoute(route.path), route);
    assert.match(sitemap, new RegExp(`https://zhonigolf\\.com${route.path}`.replaceAll("/", "\\/")));
    assert.match(app, new RegExp(route.path.replaceAll("/", "\\/")));
    assert.match(llms, new RegExp(`https://zhonigolf\\.com${route.path}`.replaceAll("/", "\\/")));

    const document = await readFile(new URL(`../dist/client/${route.path.slice(1)}index.html`, import.meta.url), "utf8");
    assert.match(document, /<h1(?:\s|>)/);
    assert.match(document, new RegExp(heading));
    assert.match(document, new RegExp(question.replaceAll("?", "\\?")));
    assert.match(document, new RegExp(`data-buyer-evidence="${marker}"`));
    assert.match(document, new RegExp(`solution=${marker}&amp;source=${marker}`));
    for (const path of ["/custom-golf-headcovers/", "/custom-golf-caps/", "/custom-golf-towels/", "/custom-golf-accessories/", "/custom-golf-packaging/", "/our-process/", "/request-a-quote/", "/guides/"]) {
      assert.match(document, new RegExp(path.replaceAll("/", "\\/")), `Expected ${path} on ${route.path}.`);
    }

    const schemaMatch = document.match(/<script id="zhoni-page-schema" type="application\/ld\+json">([\s\S]*?)<\/script>/);
    const graph = JSON.parse(schemaMatch[1])["@graph"];
    assert.ok(graph.some((entity) => entity["@type"] === "Service"));
    assert.ok(graph.some((entity) => entity["@type"] === "FAQPage"));
    const breadcrumb = graph.find((entity) => entity["@type"] === "BreadcrumbList");
    assert.equal(breadcrumb.itemListElement[1].name, "Solutions");
  }

  assert.match(app, /"club-member-programs": "Club member program"/);
  assert.match(app, /"private-label-collections": "Private label collection"/);

  const [collectionGuide, briefGuide] = await Promise.all([
    readFile(new URL("../dist/client/guides/coordinated-golf-accessory-collection/index.html", import.meta.url), "utf8"),
    readFile(new URL("../dist/client/guides/custom-golf-product-development-brief/index.html", import.meta.url), "utf8"),
  ]);
  assert.match(collectionGuide, /\/solutions\/golf-club-member-programs\//);
  assert.match(briefGuide, /\/solutions\/private-label-golf-collections\//);
});

test("localizes the new solution programs in Korean and Canadian French", async () => {
  const cases = [
    [siteRoutes.koClubMemberPrograms, "ko", "ko-club-member-programs", "하나의 프로그램으로 여러 회원 순간을 지원할 수 있나요"],
    [siteRoutes.koPrivateLabelCollections, "ko", "ko-private-label-collections", "하나의 핵심 제품으로 시작할 수 있나요"],
    [siteRoutes.frCaClubMemberPrograms, "fr-CA", "fr-ca-club-member-programs", "Un même programme peut-il couvrir plusieurs moments membres"],
    [siteRoutes.frCaPrivateLabelCollections, "fr-CA", "fr-ca-private-label-collections", "Peut-on commencer par un seul produit phare"],
  ];

  for (const [route, language, evidence, question] of cases) {
    const document = await readFile(new URL(`../dist/client/${route.path.slice(1)}index.html`, import.meta.url), "utf8");
    assert.match(document, new RegExp(`<html lang="${language}">`));
    assert.match(document, new RegExp(`data-buyer-evidence="${evidence}"`));
    assert.match(document, new RegExp(question));
    assert.match(document, /solution=(?:club-member-programs|private-label-collections)&amp;source=/);
    for (const hreflang of ["en", "ko", "fr-CA", "x-default"]) assert.match(document, new RegExp(`hreflang="${hreflang}"`));
    const schemaMatch = document.match(/<script id="zhoni-page-schema" type="application\/ld\+json">([\s\S]*?)<\/script>/);
    const graph = JSON.parse(schemaMatch[1])["@graph"];
    assert.ok(graph.some((entity) => entity["@type"] === "Service"));
    assert.ok(graph.some((entity) => entity["@type"] === "FAQPage"));
    assert.equal(graph.find((entity) => entity["@type"] === "BreadcrumbList").itemListElement[1].name, language === "ko" ? "솔루션" : "Solutions");
  }

  const localizedGuides = await Promise.all([
    "ko/guides/coordinated-golf-accessory-collection",
    "ko/guides/custom-golf-product-development-brief",
    "fr-ca/guides/coordinated-golf-accessory-collection",
    "fr-ca/guides/custom-golf-product-development-brief",
  ].map((path) => readFile(new URL(`../dist/client/${path}/index.html`, import.meta.url), "utf8")));
  assert.match(localizedGuides[0], /\/ko\/solutions\/golf-club-member-programs\//);
  assert.match(localizedGuides[1], /\/ko\/solutions\/private-label-golf-collections\//);
  assert.match(localizedGuides[2], /\/fr-ca\/solutions\/golf-club-member-programs\//);
  assert.match(localizedGuides[3], /\/fr-ca\/solutions\/private-label-golf-collections\//);
});

test("emits the files required by Sites packaging", async () => {
  await access(new URL("../dist/client/index.html", import.meta.url));
  await access(new URL("../dist/server/index.js", import.meta.url));
  await access(new URL("../dist/.openai/hosting.json", import.meta.url));
});
