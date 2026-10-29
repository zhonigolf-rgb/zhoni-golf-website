import assert from "node:assert/strict";
import { access, readFile, readdir, stat } from "node:fs/promises";
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
    "/guides/custom-golf-cap-construction-fit-closures/",
    "/guides/custom-golf-cap-sampling-production-quality/",
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
  for (const topic of ["capsStyle", "capsMaterials", "capsBranding", "capsConstruction", "capsProduction"]) {
    const section = app.split(`  ${topic}: {`)[1].split("\n  },")[0];
    for (const href of requiredLinks) assert.match(section, new RegExp(href.replaceAll("/", "\\/")), `Expected ${topic} to link to ${href}.`);
  }
});

test("keeps golf caps visible in shared SEO paths and prefills the inquiry form", async () => {
  const [app, routes, robots, inquiryPrefill] = await Promise.all([
    readFile(new URL("../src/App.jsx", import.meta.url), "utf8"),
    readFile(new URL("../src/siteRoutes.js", import.meta.url), "utf8"),
    readFile(new URL("../public/robots.txt", import.meta.url), "utf8"),
    readFile(new URL("../src/inquiryPrefill.js", import.meta.url), "utf8"),
  ]);

  assert.match(routes, /caps and visors, magnetic towels, ball markers, divot tools, accessories and packaging/);
  assert.match(inquiryPrefill, /productAliases/);
  assert.match(app, /defaultValue=\{prefilledProduct\}/);
  assert.match(app, /Custom Golf Caps & Headwear/);
  assert.match(robots, /User-agent: \*\s+Allow: \/\s+\s*Sitemap: https:\/\/zhonigolf\.com\/sitemap\.xml/);
});

test("publishes a decision-ready custom golf caps product page", async () => {
  const document = await readFile(new URL("../dist/client/custom-golf-caps/index.html", import.meta.url), "utf8");
  for (const phrase of [
    "CHOOSE THE HEADWEAR DIRECTION",
    "Performance golf caps",
    "Five-panel camp caps",
    "Snapback &amp; flat-brim caps",
    "Structured tournament caps",
    "Rope caps",
    "Golf visors",
    "BUILD THE CAP SPECIFICATION",
    "SELECT THE BRANDING ROUTE",
    "3D / puff embroidery",
    "FROM BRIEF TO PACKED CAP",
    "What should be checked on a cap sample?",
    "BUILD YOUR HEADWEAR BRIEF",
  ]) assert.match(document, new RegExp(phrase.replaceAll("/", "\\/")));
  assert.match(document, /data-buyer-evidence="product-caps"/);
  assert.match(document, /\/request-a-quote\/\?product=Custom%20Golf%20Caps%20%26%20Headwear/);
});

test("publishes a complete five-guide custom golf cap knowledge cluster with original visuals", async () => {
  const sitemap = await readFile(new URL("../public/sitemap.xml", import.meta.url), "utf8");
  const guides = [
    [siteRoutes.capsStyleGuide, "zhoni-cap-guide-styles-v1.png", "Which custom golf cap style is most versatile?"],
    [siteRoutes.capsMaterialsGuide, "zhoni-cap-guide-materials-v1.png", "Is cotton always more premium than polyester?"],
    [siteRoutes.capsBrandingGuide, "zhoni-cap-guide-branding-v1.png", "When should we use a patch instead of embroidery?"],
    [siteRoutes.capsConstructionGuide, "zhoni-cap-guide-construction-v1.png", "Which closure feels most premium?"],
    [siteRoutes.capsProductionGuide, "zhoni-cap-guide-sampling-v1.png", "Is a physical cap sample always necessary?"],
  ];
  for (const [route, image, question] of guides) {
    assert.match(sitemap, new RegExp(route.path.replaceAll("/", "\\/")));
    const document = await readFile(new URL(`../dist/client/${route.path.slice(1)}index.html`, import.meta.url), "utf8");
    assert.match(document, new RegExp(image.replaceAll(".", "\\.")));
    assert.match(document, new RegExp(question.replaceAll("?", "\\?")));
    assert.match(document, /COMMON BUYER QUESTIONS/);
    assert.match(document, /Custom Golf Caps &amp; Headwear/);
  }
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
    assert.match(document, /data-buyer-evidence="ja-guide-/);
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

test("completes the Japanese gift, event, quote, and capabilities round", async () => {
  const [sitemap, hub] = await Promise.all([
    readFile(new URL("../public/sitemap.xml", import.meta.url), "utf8"),
    readFile(new URL("../dist/client/ja/guides/index.html", import.meta.url), "utf8"),
  ]);
  const guideKeys = [
    "jaGolfGiftGuide", "jaAudienceGiftGuide", "jaTournamentGuide", "jaCorporateGuide",
    "jaTournamentGiftBudgetGuide", "jaPlayerPackGuide", "jaRecipientRolesGuide",
    "jaPremiumGiftSetGuide", "jaEventBriefGuide", "jaQuoteComparisonGuide",
  ];

  for (const key of guideKeys) {
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
    assert.match(document, /data-buyer-evidence="ja-guide-/);
    assert.match(document, /よくある質問/);
    for (const path of ["/ja/products/", "/ja/solutions/", "/ja/our-process/", "/ja/request-a-quote/"]) {
      assert.match(document, new RegExp(path.replaceAll("/", "\\/")), `Expected ${path} on ${route.path}.`);
    }
    const schemaMatch = document.match(/<script id="zhoni-page-schema" type="application\/ld\+json">([\s\S]*?)<\/script>/);
    const graph = JSON.parse(schemaMatch[1])["@graph"];
    assert.ok(graph.some((entity) => entity["@type"] === "Article"));
    assert.ok(graph.some((entity) => entity["@type"] === "FAQPage"));
  }

  const capabilityRoute = siteRoutes.jaCapabilities;
  assert.equal(findRoute(capabilityRoute.path), capabilityRoute);
  assert.match(sitemap, /https:\/\/zhonigolf\.com\/ja\/capabilities\//);
  const capabilityDocument = await readFile(new URL("../dist/client/ja/capabilities/index.html", import.meta.url), "utf8");
  assert.match(capabilityDocument, /<html lang="ja">/);
  assert.match(capabilityDocument, /data-buyer-evidence="ja-capabilities"/);
  assert.match(capabilityDocument, /製品から引き渡しまでをつなぐ/);
  for (const path of ["/ja/products/", "/ja/solutions/", "/ja/guides/", "/ja/our-process/", "/ja/request-a-quote/"]) {
    assert.match(capabilityDocument, new RegExp(path.replaceAll("/", "\\/")), `Expected ${path} on Japanese capabilities.`);
  }
});

test("keeps completed Japanese routes in full parity with English", async () => {
  const template = await readFile(new URL("../index.html", import.meta.url), "utf8");
  const sitemap = await readFile(new URL("../public/sitemap.xml", import.meta.url), "utf8");
  const hub = await readFile(new URL("../src/JapaneseExpansion.jsx", import.meta.url), "utf8");
  const englishRoutes = Object.values(siteRoutes).filter((route) => !route.lang && route.localeStage !== "pending");
  const japaneseRoutes = Object.values(siteRoutes).filter((route) => route.lang === "ja");
  const japaneseByEnglishPath = new Map(japaneseRoutes.map((route) => [route.alternatePath, route]));

  assert.equal(englishRoutes.length, 65);
  assert.equal(japaneseRoutes.length, englishRoutes.length);

  for (const englishRoute of englishRoutes) {
    const japaneseRoute = japaneseByEnglishPath.get(englishRoute.path);
    assert.ok(japaneseRoute, `Expected a Japanese route for ${englishRoute.path}.`);
    assert.equal(findRoute(japaneseRoute.path), japaneseRoute);
    assert.match(sitemap, new RegExp(`https://zhonigolf\\.com${japaneseRoute.path}`.replaceAll("/", "\\/")));
    const englishDocument = renderRouteDocument(template, englishRoute);
    const japaneseDocument = renderRouteDocument(template, japaneseRoute);
    assert.match(englishDocument, new RegExp(`hreflang="ja" href="https://zhonigolf\\.com${japaneseRoute.path.replaceAll("/", "\\/")}"`));
    assert.match(japaneseDocument, new RegExp(`hreflang="en" href="https://zhonigolf\\.com${englishRoute.path.replaceAll("/", "\\/")}"`));
  }

  const japaneseGuideArticles = japaneseRoutes.filter((route) => route.path.startsWith("/ja/guides/") && route.path !== "/ja/guides/");
  assert.ok(japaneseGuideArticles.length > 20);
  for (const route of japaneseGuideArticles) {
    assert.match(hub, new RegExp(route.path.replaceAll("/", "\\/")), `Missing ${route.path} from Japanese guide center.`);
  }
});

test("publishes the first German locale round with localized SEO and conversion paths", async () => {
  const [sitemap, germanSite, app, locale, serverEntry] = await Promise.all([
    readFile(new URL("../public/sitemap.xml", import.meta.url), "utf8"),
    readFile(new URL("../src/GermanSite.jsx", import.meta.url), "utf8"),
    readFile(new URL("../src/App.jsx", import.meta.url), "utf8"),
    readFile(new URL("../src/locale.jsx", import.meta.url), "utf8"),
    readFile(new URL("../src/entry-server.jsx", import.meta.url), "utf8"),
  ]);
  const keys = ["deHome", "deProducts", "deSolutions", "deProcess", "deFaq", "deAbout", "deQuote"];

  for (const key of keys) {
    const route = siteRoutes[key];
    assert.equal(findRoute(route.path), route);
    assert.equal(route.lang, "de");
    assert.match(sitemap, new RegExp(`https://zhonigolf\\.com${route.path}`.replaceAll("/", "\\/")));
    const document = await readFile(new URL(`../dist/client/${route.path.slice(1)}index.html`, import.meta.url), "utf8");
    assert.match(document, /<html lang="de">/);
    assert.match(document, /<h1(?:\s|>)/);
    assert.match(document, new RegExp(`hreflang="en" href="https://zhonigolf\\.com${route.alternatePath.replaceAll("/", "\\/")}"`));
    assert.match(document, new RegExp(`hreflang="de" href="https://zhonigolf\\.com${route.path.replaceAll("/", "\\/")}"`));
    assert.match(document, /data-buyer-evidence="de-/);
    for (const path of ["/de/products/", "/de/solutions/", "/de/our-process/", "/de/request-a-quote/"]) {
      assert.match(document, new RegExp(path.replaceAll("/", "\\/")), `Expected ${path} on ${route.path}.`);
    }
  }

  const faqDocument = await readFile(new URL("../dist/client/de/faq/index.html", import.meta.url), "utf8");
  const faqSchemaMatch = faqDocument.match(/<script id="zhoni-page-schema" type="application\/ld\+json">([\s\S]*?)<\/script>/);
  const faqGraph = JSON.parse(faqSchemaMatch[1])["@graph"];
  assert.ok(faqGraph.some((entity) => entity["@type"] === "FAQPage"));
  assert.match(germanSite, /data\.set\("page_language", "de"\)/);
  assert.match(germanSite, /form_name:"de_quote_page_project_brief"/);
  assert.match(germanSite, /sales@zhonigolf\.com/);
  assert.match(germanSite, /\+86 177 5919 0848/);
  assert.match(app, /lazy\(\(\) => import\("\.\/GermanSite\.jsx"\)/);
  assert.match(app, /route\.lang === "de"/);
  assert.match(locale, /code: "de", label: "Deutsch"/);
  assert.match(serverEntry, /GermanSiteComponent=\{GermanSite\}/);
});

test("publishes German product and solution detail pages with complete buyer paths", async () => {
  const [sitemap, germanSite, expansion] = await Promise.all([
    readFile(new URL("../public/sitemap.xml", import.meta.url), "utf8"),
    readFile(new URL("../src/GermanSite.jsx", import.meta.url), "utf8"),
    readFile(new URL("../src/GermanExpansion.jsx", import.meta.url), "utf8"),
  ]);
  const categoryKeys = ["deHeadcovers", "deCaps", "deTowels", "deAccessories", "dePackaging"];
  const solutionKeys = ["deTournamentGifts", "deCorporateGifts", "deClubMemberPrograms", "dePrivateLabelCollections"];

  for (const key of [...categoryKeys, ...solutionKeys]) {
    const route = siteRoutes[key];
    assert.equal(findRoute(route.path), route);
    assert.equal(route.lang, "de");
    assert.match(sitemap, new RegExp(`https://zhonigolf\\.com${route.path}`.replaceAll("/", "\\/")));
    const document = await readFile(new URL(`../dist/client/${route.path.slice(1)}index.html`, import.meta.url), "utf8");
    assert.match(document, /<html lang="de">/);
    assert.match(document, /<h1(?:\s|>)/);
    assert.match(document, new RegExp(`hreflang="en" href="https://zhonigolf\\.com${route.alternatePath.replaceAll("/", "\\/")}"`));
    assert.match(document, new RegExp(`hreflang="de" href="https://zhonigolf\\.com${route.path.replaceAll("/", "\\/")}"`));
    assert.match(document, /data-buyer-evidence="de-/);
    for (const path of ["/de/products/", "/de/solutions/", "/de/our-process/", "/de/request-a-quote/"]) {
      assert.match(document, new RegExp(path.replaceAll("/", "\\/")), `Expected ${path} on ${route.path}.`);
    }
    const schemaMatch = document.match(/<script id="zhoni-page-schema" type="application\/ld\+json">([\s\S]*?)<\/script>/);
    const graph = JSON.parse(schemaMatch[1])["@graph"];
    assert.ok(graph.some((entity) => entity["@type"] === "Service"));
    if (solutionKeys.includes(key)) assert.ok(graph.some((entity) => entity["@type"] === "FAQPage"));
  }

  for (const product of ["Personalisierte Golf-Headcover", "Personalisierte Golfcaps & Visoren", "Personalisierte Golfhandtücher", "Personalisierte Golfaccessoires", "Individuelle Golfverpackung"]) {
    assert.match(expansion, new RegExp(product.replace(/[&]/g, "&")));
    assert.match(germanSite, new RegExp(product.replace(/[&]/g, "&")));
  }
  assert.match(germanSite, /<GermanExpansion routeKey=\{routeKey\}/);
  assert.match(expansion, /same|dieselbe Spezifikationsbasis/i);
});

test("keeps completed German routes in full parity with English and indexes every guide", async () => {
  const [template, sitemap, hub] = await Promise.all([
    readFile(new URL("../index.html", import.meta.url), "utf8"),
    readFile(new URL("../public/sitemap.xml", import.meta.url), "utf8"),
    readFile(new URL("../src/GermanGuides.jsx", import.meta.url), "utf8"),
  ]);
  const englishRoutes = Object.values(siteRoutes).filter((route) => !route.lang && route.localeStage !== "pending");
  const germanRoutes = Object.values(siteRoutes).filter((route) => route.lang === "de");
  const germanByEnglishPath = new Map(germanRoutes.map((route) => [route.alternatePath, route]));

  assert.equal(englishRoutes.length, 65);
  assert.equal(germanRoutes.length, englishRoutes.length);

  for (const englishRoute of englishRoutes) {
    const germanRoute = germanByEnglishPath.get(englishRoute.path);
    assert.ok(germanRoute, `Expected a German route for ${englishRoute.path}.`);
    assert.equal(findRoute(germanRoute.path), germanRoute);
    assert.match(sitemap, new RegExp(`https://zhonigolf\\.com${germanRoute.path}`.replaceAll("/", "\\/")));
    const englishDocument = renderRouteDocument(template, englishRoute);
    const germanDocument = renderRouteDocument(template, germanRoute);
    assert.match(englishDocument, new RegExp(`hreflang="de" href="https://zhonigolf\\.com${germanRoute.path.replaceAll("/", "\\/")}"`));
    assert.match(germanDocument, new RegExp(`hreflang="en" href="https://zhonigolf\\.com${englishRoute.path.replaceAll("/", "\\/")}"`));
  }

  const germanGuideArticles = germanRoutes.filter((route) => route.path.startsWith("/de/guides/") && route.path !== "/de/guides/");
  assert.equal(germanGuideArticles.length, 42);
  for (const route of germanGuideArticles) {
    assert.match(hub, new RegExp(route.path.replaceAll("/", "\\/")), `Missing ${route.path} from German guide center.`);
    const document = await readFile(new URL(`../dist/client/${route.path.slice(1)}index.html`, import.meta.url), "utf8");
    assert.match(document, /data-buyer-evidence="de-guide-/);
    assert.match(document, /HÄUFIGE FRAGEN VON EINKÄUFERN/);
    for (const path of ["/de/products/", "/de/solutions/", "/de/our-process/", "/de/request-a-quote/"]) {
      assert.match(document, new RegExp(path.replaceAll("/", "\\/")), `Expected ${path} on ${route.path}.`);
    }
    const schemaMatch = document.match(/<script id="zhoni-page-schema" type="application\/ld\+json">([\s\S]*?)<\/script>/);
    const graph = JSON.parse(schemaMatch[1])["@graph"];
    assert.ok(graph.some((entity) => entity["@type"] === "Article"));
    assert.ok(graph.some((entity) => entity["@type"] === "FAQPage"));
  }

  for (const key of ["deGolfGifts", "deFirstOrder", "deExportReadiness"]) {
    const route = siteRoutes[key];
    assert.match(hub, new RegExp(route.path.replaceAll("/", "\\/")), `Missing ${route.path} from German guide center.`);
    const document = await readFile(new URL(`../dist/client/${route.path.slice(1)}index.html`, import.meta.url), "utf8");
    assert.match(document, /data-buyer-evidence="de-hub-/);
  }

  const capabilities = await readFile(new URL("../dist/client/de/capabilities/index.html", import.meta.url), "utf8");
  assert.match(capabilities, /data-buyer-evidence="de-capabilities"/);
  assert.match(capabilities, /Produkt bis zur Übergabe/);
  for (const path of ["/de/products/", "/de/solutions/", "/de/guides/", "/de/our-process/", "/de/request-a-quote/"]) {
    assert.match(capabilities, new RegExp(path.replaceAll("/", "\\/")));
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
  const englishRoutes = Object.values(siteRoutes).filter(route => !route.lang && route.localeStage !== "pending");
  const koreanRoutes = Object.values(siteRoutes).filter(route => route.lang === "ko");
  assert.equal(englishRoutes.length, 65);
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
  const englishRoutes = Object.values(siteRoutes).filter((route) => !route.lang && route.localeStage !== "pending");
  const frenchRoutes = Object.values(siteRoutes).filter((route) => route.lang === "fr-CA");
  const frenchByEnglishPath = new Map(frenchRoutes.map((route) => [route.alternatePath, route]));

  assert.equal(englishRoutes.length, 65);
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
    "zhoni-product-packaging-v3.png",
  ];

  for (const asset of assets) {
    const path = new URL(`../public/assets/images/${asset}`, import.meta.url);
    await access(path);
    assert.match(app, new RegExp(asset.replaceAll(".", "\\.")));
  }
});

test("publishes ball markers and divot tools as a product-first route in every locale", async () => {
  const sitemap = await readFile(new URL("../public/sitemap.xml", import.meta.url), "utf8");
  const app = await readFile(new URL("../src/App.jsx", import.meta.url), "utf8");
  const routes = [
    [siteRoutes.ballMarkers, "Ball markers &amp; divot tools"],
    [siteRoutes.koBallMarkers, "볼 마커 &amp; 디봇 툴"],
    [siteRoutes.frCaBallMarkers, "Marque-balles et relève-pitchs"],
    [siteRoutes.jaBallMarkers, "ボールマーカー＆グリーンフォーク"],
    [siteRoutes.deBallMarkers, "Personalisierte Ballmarker &amp; Pitchgabeln"],
  ];

  for (const [route, projectType] of routes) {
    assert.match(sitemap, new RegExp(`https://zhonigolf\\.com${route.path}`.replaceAll("/", "\\/")));
    const document = await readFile(new URL(`../dist/client${route.path}index.html`, import.meta.url), "utf8");
    assert.match(document, /ball-marker-product-page/);
    assert.match(document, /zhoni-product-ball-markers-v3\.png/);
    assert.match(document, /"@type":"Service"/);
    assert.match(document, /"@type":"BreadcrumbList"/);
    assert.match(document, new RegExp(`product=${encodeURIComponent(projectType.replaceAll("&amp;", "&"))}`.replaceAll("%", "%")));
  }

  const primary = app.indexOf('className="button button-primary" href="/products/"');
  const secondary = app.indexOf('className="button button-secondary" href="/request-a-quote/"');
  assert.ok(primary >= 0 && secondary > primary, "Expected products before the secondary quote CTA.");
  assert.doesNotMatch(app, /\["Gift Sets",[^\n]+zhoni-product-gift-sets-v3\.png/);
});

test("publishes an original, responsive ball marker manufacturing guide", async () => {
  const route = siteRoutes.ballMarkerManufacturingGuide;
  const document = await readFile(new URL(`../dist/client${route.path}index.html`, import.meta.url), "utf8");
  const variants = [
    "zhoni-ball-marker-manufacturing-stages-v1-480.avif",
    "zhoni-ball-marker-manufacturing-stages-v1-960.webp",
    "zhoni-ball-marker-manufacturing-stages-v1-1536.avif",
    "zhoni-ball-marker-magnetic-hardware-qc-v1-480.webp",
    "zhoni-ball-marker-magnetic-hardware-qc-v1-960.avif",
    "zhoni-ball-marker-magnetic-hardware-qc-v1-1536.webp",
  ];

  for (const asset of variants) {
    await access(new URL(`../public/assets/images/responsive/${asset}`, import.meta.url));
    assert.match(document, new RegExp(asset.replaceAll(".", "\\.")));
  }

  assert.match(document, /Custom Golf Ball Marker Manufacturing:/);
  assert.match(document, /TYPICAL PRODUCTION SEQUENCE/);
  assert.match(document, /HARDWARE &amp; ASSEMBLY/);
  assert.match(document, /"@type":"Article"/);
  assert.match(document, /"@type":"FAQPage"/);
  assert.match(document, /property="og:image" content="https:\/\/zhonigolf\.com\/assets\/images\/responsive\/zhoni-ball-marker-manufacturing-stages-v1-1536\.webp"/);
  assert.doesNotMatch(document, /10PCS|free sample|PGA|ROYAL TROON/i);
});

test("connects localized ball marker guides to the matching product and inquiry language", async () => {
  const { ballMarkerLocales } = await import("../src/content/ball-marker-locales.js");
  const { ballMarkerProductLocales } = await import("../src/content/ball-marker-product-locales.js");
  const routes = Object.values(siteRoutes).filter(route => route.lang && route.alternatePath === siteRoutes.ballMarkerManufacturingGuide.path);
  assert.equal(routes.length, 4);
  for (const route of routes) {
    const copy = ballMarkerLocales[route.lang];
    const prefix = route.lang === "fr-CA" ? "/fr-ca" : `/${route.lang}`;
    const html = await readFile(new URL(`../dist/client${route.path}index.html`, import.meta.url), "utf8");
    const product = await readFile(new URL(`../dist/client${prefix}/custom-golf-ball-markers-divot-tools/index.html`, import.meta.url), "utf8");
    const hub = await readFile(new URL(`../dist/client${prefix}/guides/index.html`, import.meta.url), "utf8");
    const quote = await readFile(new URL(`../dist/client${prefix}/request-a-quote/index.html`, import.meta.url), "utf8");
    const schema = JSON.parse(html.match(/<script id="zhoni-page-schema" type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
    assert.equal(schema["@graph"].find(node => node["@type"] === "FAQPage").mainEntity.length, 11);
    assert.equal(schema["@graph"].find(node => node["@type"] === "Article").inLanguage, route.lang);
    assert.ok(html.includes(`product=${encodeURIComponent(copy.product)}`));
    assert.match(quote, /<input[^>]*name="project_type"/);
    assert.doesNotMatch(quote, /<select[^>]*name="project_type"/);
    assert.ok(hub.includes(route.path));
    assert.ok(product.includes(route.path));
    const details = ballMarkerProductLocales[route.lang];
    const productSchema = JSON.parse(product.match(/<script id="zhoni-page-schema" type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
    const productFaq = productSchema["@graph"].find(node => node["@type"] === "FAQPage");
    assert.equal(productFaq.inLanguage, route.lang);
    assert.deepEqual(productFaq.mainEntity.map(item => [item.name, item.acceptedAnswer.text]), details.faqs);
    const specs = product.match(/<section class="headcover-specs">([\s\S]*?)<\/section>/)[1];
    assert.equal([...specs.matchAll(/<dt>/g)].length, 5);
    for (const [term] of details.specs) assert.ok(specs.includes(term.replaceAll("&", "&amp;")));
    const sampleProcess = product.match(/<section class="headcover-process">([\s\S]*?)<\/section>/)[1];
    assert.equal([...sampleProcess.matchAll(/<li>/g)].length, 5);
    assert.ok(sampleProcess.includes(details.processTitle));
    for (const [, title] of details.process) assert.ok(sampleProcess.includes(title.replaceAll("&", "&amp;")));
    assert.doesNotMatch(product, /BUILD THE PRODUCT SPECIFICATION|COMMON BUYER QUESTIONS|SAMPLE &amp; QUALITY PATH|NEXT STEP/);
    for (const [title] of copy.stages) assert.ok(product.includes(title.replaceAll("&", "&amp;")));
    for (const alternate of routes) assert.ok(html.includes(`hreflang="${alternate.lang}" href="https://zhonigolf.com${alternate.path}"`));
    const body = html.split('<div id="root">')[1];
    const links = [...body.matchAll(/href="(\/[^"#]*)"/g)].map(match => match[1]);
    assert.ok(links.every(href => href.startsWith(`${prefix}/`)), "Body links must stay in the active language");
  }
});

test("publishes product-specific procurement answers in all five languages", async () => {
  const { procurementAnswers, procurementGuideProducts } = await import("../src/content/procurement-answers.js");
  const { guideAnswerIntros } = await import("../src/content/guide-answer-intros.js");
  const routes = Object.values(siteRoutes).filter(route => procurementGuideProducts[route.alternatePath ?? route.path]);
  assert.equal(routes.length, 20);
  for (const route of routes) {
    const copy = procurementAnswers[route.lang ?? "en"];
    const product = procurementGuideProducts[route.alternatePath ?? route.path];
    const document = await readFile(new URL(`../dist/client${route.path}index.html`, import.meta.url), "utf8");
    const introCopy = guideAnswerIntros[route.lang ?? "en"].products[product];
    const intro = document.match(/<section class="guide-intro guide-answer-intro"[^>]*>([\s\S]*?)<\/section>/)?.[1];
    assert.ok(intro, `Expected a direct answer on ${route.path}`);
    const encodeHtml = value => value.replaceAll("&", "&amp;").replaceAll("'", "&#x27;").replaceAll('"', "&quot;");
    assert.ok(intro.includes(encodeHtml(introCopy.answer)), route.path);
    assert.ok(document.indexOf('data-guide-answer=') < document.indexOf('data-procurement-product='));
    const link = intro.match(/href="([^"]+)"/)[1];
    const target = findRoute(link);
    assert.ok(target, `Product link must resolve on ${route.path}`);
    assert.equal(target.lang ?? "en", route.lang ?? "en");
    assert.ok(!link.includes("/guides/"));
    const comparison = document.match(/<section class="guide-table guide-answer-comparison"[^>]*>([\s\S]*?)<\/section>/)[1];
    assert.equal([...comparison.matchAll(/scope="row"/g)].length, 3);
    for (const row of introCopy.rows) for (const value of row) assert.ok(comparison.includes(encodeHtml(value)), route.path);
    assert.equal(document.split(`data-procurement-product="${product}"`).length - 1, 1, route.path);
    const graph = JSON.parse(document.match(/<script id="zhoni-page-schema" type="application\/ld\+json">([\s\S]*?)<\/script>/)[1])["@graph"];
    const faq = graph.find(item => item["@type"] === "FAQPage");
    for (const [index, question] of copy.questions.entries()) {
      const entity = faq.mainEntity.find(item => item.name === question);
      assert.ok(entity, `Missing procurement FAQ on ${route.path}: ${question}`);
      assert.equal(entity.acceptedAnswer.text, copy.products[product][index]);
    }
  }
  const unrelated = await readFile(new URL("../dist/client/guides/custom-golf-headcovers-procurement-guide/index.html", import.meta.url), "utf8");
  assert.doesNotMatch(unrelated, /data-procurement-product=/);
});

test("connects the ten product planning directions to optional inquiries in five languages", async () => {
  const { productPlanGroups, productPlanCopy, resolveInquiryPlan } = await import("../src/content/product-plans.js");
  const routes = Object.values(siteRoutes).filter(route => productPlanGroups[route.alternatePath ?? route.path]);
  assert.equal(routes.length, 20);
  let count = 0;
  for (const route of routes) {
    const locale = route.lang ?? "en";
    const ids = productPlanGroups[route.alternatePath ?? route.path];
    const document = await readFile(new URL(`../dist/client${route.path}index.html`, import.meta.url), "utf8");
    assert.equal(document.split('class="product-plan-options"').length - 1, 1, route.path);
    const matches = [...document.matchAll(/<a href="([^"]+)" data-analytics-placement="product_plan"/g)];
    assert.equal(matches.length, ids.length);
    for (const [index, match] of matches.entries()) {
      const url = new URL(match[1].replaceAll("&amp;", "&"), "https://zhonigolf.com");
      assert.equal(findRoute(url.pathname).lang ?? "en", locale);
      assert.equal(url.searchParams.get("plan"), ids[index]);
      assert.equal(url.searchParams.get("source"), `product-plan-${ids[index].toLowerCase()}`);
      const value = resolveInquiryPlan(url.searchParams, "", locale);
      assert.ok(value.includes(ids[index]));
      assert.ok(value.includes(productPlanCopy[locale].plans[ids[index]][0]));
      assert.ok(value.length <= 140);
      count++;
    }
  }
  assert.equal(count, 50);
  assert.equal(resolveInquiryPlan(new URLSearchParams("plan=UNKNOWN"), "Custom golf towels"), "Custom golf towels");
  assert.equal(resolveInquiryPlan(new URLSearchParams(), ""), "");
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
  const [sitemap, app, llms, inquiryPrefill] = await Promise.all([
    readFile(new URL("../public/sitemap.xml", import.meta.url), "utf8"),
    readFile(new URL("../src/App.jsx", import.meta.url), "utf8"),
    readFile(new URL("../public/llms.txt", import.meta.url), "utf8"),
    readFile(new URL("../src/inquiryPrefill.js", import.meta.url), "utf8"),
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

  assert.match(inquiryPrefill, /"club-member-programs": "Club member program"/);
  assert.match(inquiryPrefill, /"private-label-collections": "Private label collection"/);

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

test("self-hosts fonts and keeps internal route code out of the homepage bundle", async () => {
  const cssFiles = ["styles.css", "products.css", "zhoni-pages.css"];
  for (const file of cssFiles) {
    const css = await readFile(new URL(`../src/${file}`, import.meta.url), "utf8");
    assert.doesNotMatch(css, /fonts\.(?:googleapis|gstatic)\.com/);
  }

  const fontCss = await readFile(new URL("../src/fonts.css", import.meta.url), "utf8");
  assert.match(fontCss, /font-display:swap/);
  for (const font of ["dm-sans-latin.woff2", "dm-mono-500-latin.woff2", "instrument-serif-normal-latin.woff2", "playfair-display-latin.woff2"]) {
    await access(new URL(`../public/assets/fonts/${font}`, import.meta.url));
    assert.match(fontCss, new RegExp(font.replaceAll(".", "\\.")));
  }

  const mainSource = await readFile(new URL("../src/main.jsx", import.meta.url), "utf8");
  assert.doesNotMatch(mainSource, /import\s+\{\s*App\s*\}\s+from/);
  assert.match(mainSource, /import\("\.\/HomePage\.jsx"\)/);
  assert.match(mainSource, /import\("\.\/App\.jsx"\)/);

  const assetDirectory = new URL("../dist/client/assets/", import.meta.url);
  const files = await readdir(assetDirectory);
  const homeChunk = files.find(file => /^HomePage-.*\.js$/.test(file));
  const internalChunk = files.find(file => /^App-.*\.js$/.test(file));
  const entryChunk = files.find(file => /^index-.*\.js$/.test(file));
  assert.ok(homeChunk && internalChunk && entryChunk, "Expected separate entry, homepage and internal route chunks.");
  const homepageBytes = (await stat(new URL(homeChunk, assetDirectory))).size + (await stat(new URL(entryChunk, assetDirectory))).size;
  assert.ok(homepageBytes < 250_000, `Expected homepage JavaScript below 250 KB before gzip, received ${homepageBytes}.`);
  assert.ok((await stat(new URL(internalChunk, assetDirectory))).size > (await stat(new URL(homeChunk, assetDirectory))).size);
});

test("publishes a decision-ready headcover product page and specialized brief", async () => {
  const [document, app, routes] = await Promise.all([
    readFile(new URL("../dist/client/custom-golf-headcovers/index.html", import.meta.url), "utf8"),
    readFile(new URL("../src/App.jsx", import.meta.url), "utf8"),
    readFile(new URL("../src/siteRoutes.js", import.meta.url), "utf8"),
  ]);

  for (const phrase of [
    "Driver, fairway &amp; hybrid",
    "Blade &amp; mallet putter",
    "Plush &amp; novelty characters",
    "Logo &amp; surface craft",
    "Opening &amp; closure",
    "FROM REFERENCE TO PRODUCTION",
  ]) assert.match(document, new RegExp(phrase));

  assert.match(document, /\/custom-plush-golf-headcovers\//);
  assert.match(app, /name="headcover_material"/);
  assert.match(app, /name="headcover_branding"/);
  assert.match(app, /name="headcover_closure"/);
  assert.match(app, /name="headcover_packaging"/);
  assert.match(routes, /Custom Golf Headcovers for Brands & Clubs \| ZHONI/);

  const schemaMatch = document.match(/<script id="zhoni-page-schema" type="application\/ld\+json">([\s\S]*?)<\/script>/);
  const graph = JSON.parse(schemaMatch[1])["@graph"];
  const faq = graph.find((entity) => entity["@type"] === "FAQPage");
  assert.equal(faq.mainEntity.length, 6);
  assert.ok(faq.mainEntity.some((entry) => entry.name.includes("plush character")));
});

test("publishes the plush headcover product and four connected buyer guides", async () => {
  const sitemap = await readFile(new URL("../public/sitemap.xml", import.meta.url), "utf8");
  const hub = await readFile(new URL("../dist/client/guides/index.html", import.meta.url), "utf8");
  const product = await readFile(new URL("../dist/client/custom-plush-golf-headcovers/index.html", import.meta.url), "utf8");
  const routes = [siteRoutes.plushDesignGuide, siteRoutes.plushMaterialsGuide, siteRoutes.plushBrandingGuide, siteRoutes.plushSampleGuide];

  assert.match(product, /CUSTOM PLUSH &amp; NOVELTY GOLF HEADCOVERS/);
  assert.match(product, /Mascots &amp; animals/);
  assert.match(product, /Rights &amp; reference check/);
  assert.match(product, /third-party characters, team marks or protected designs/);
  assert.match(product, /zhoni-plush-headcover-construction-v1\.jpg/);
  assert.match(product, /REVIEW A PLUSH HEADCOVER PROJECT/);
  assert.match(product, /headcover_type=Plush%20%2F%20novelty%20character/);
  assert.match(product, /data-buyer-evidence="product-plush-headcovers"/);
  assert.match(sitemap, /https:\/\/zhonigolf\.com\/custom-plush-golf-headcovers\//);

  const productSchema = JSON.parse(product.match(/<script id="zhoni-page-schema" type="application\/ld\+json">([\s\S]*?)<\/script>/)[1])["@graph"];
  assert.ok(productSchema.some((entity) => entity["@type"] === "Service"));
  assert.equal(productSchema.find((entity) => entity["@type"] === "FAQPage").mainEntity.length, 6);

  for (const route of routes) {
    assert.match(sitemap, new RegExp(`https://zhonigolf\\.com${route.path}`.replaceAll("/", "\\/")));
    assert.match(hub, new RegExp(route.path.replaceAll("/", "\\/")));
    const guide = await readFile(new URL(`../dist/client/${route.path.slice(1)}index.html`, import.meta.url), "utf8");
    for (const path of [siteRoutes.plushHeadcovers.path, siteRoutes.headcovers.path, siteRoutes.process.path, "/request-a-quote/"]) {
      assert.match(guide, new RegExp(path.replaceAll("/", "\\/")), `Expected ${path} on ${route.path}.`);
    }
    const graph = JSON.parse(guide.match(/<script id="zhoni-page-schema" type="application\/ld\+json">([\s\S]*?)<\/script>/)[1])["@graph"];
    assert.ok(graph.some((entity) => entity["@type"] === "Article"));
    assert.ok(graph.some((entity) => entity["@type"] === "FAQPage"));
  }
});

test("publishes the five-guide championship-season planning cluster", async () => {
  const sitemap = await readFile(new URL("../public/sitemap.xml", import.meta.url), "utf8");
  const hub = await readFile(new URL("../dist/client/guides/index.html", import.meta.url), "utf8");
  const routes = [
    [siteRoutes.majorTournamentCalendarGuide, "zhoni-2027-tournament-planning-hero-v1.jpg"],
    [siteRoutes.championshipHospitalityGuide, "zhoni-championship-hospitality-hero-v1.jpg"],
    [siteRoutes.golfEventGiftTiersGuide, "zhoni-event-gift-tiers-hero-v1.jpg"],
    [siteRoutes.eventFormatsGiftGuide, "zhoni-event-formats-hero-v1.jpg"],
    [siteRoutes.weatherReadyTournamentGuide, "zhoni-weather-ready-hero-v1.jpg"],
  ];

  for (const [route, image] of routes) {
    assert.match(sitemap, new RegExp(`https://zhonigolf\\.com${route.path}`.replaceAll("/", "\\/")));
    assert.match(hub, new RegExp(route.path.replaceAll("/", "\\/")), `Missing ${route.path} from buyer guide hub.`);
    const guide = await readFile(new URL(`../dist/client/${route.path.slice(1)}index.html`, import.meta.url), "utf8");
    await access(new URL(`../public/assets/images/${image}`, import.meta.url));
    assert.match(guide, new RegExp(image.replaceAll(".", "\\.")));
    assert.match(guide, /SHORT ANSWER/);
    assert.match(guide, /EDITORIAL &amp; TRADEMARK NOTE/);
    assert.match(guide, /not affiliated with or endorsed by any tournament/);
    assert.match(guide, /\/solutions\/golf-tournament-gifts\/|\/solutions\/corporate-golf-gifts\//);
    assert.match(guide, /\/request-a-quote\/\?source=/);

    const graph = JSON.parse(guide.match(/<script id="zhoni-page-schema" type="application\/ld\+json">([\s\S]*?)<\/script>/)[1])["@graph"];
    assert.ok(graph.some((entity) => entity["@type"] === "Article"));
    assert.ok(graph.some((entity) => entity["@type"] === "FAQPage"));
    assert.equal(graph.find((entity) => entity["@type"] === "FAQPage").mainEntity.length, 4);
  }

  const calendar = await readFile(new URL(`../dist/client/${siteRoutes.majorTournamentCalendarGuide.path.slice(1)}index.html`, import.meta.url), "utf8");
  const tiers = await readFile(new URL(`../dist/client/${siteRoutes.golfEventGiftTiersGuide.path.slice(1)}index.html`, import.meta.url), "utf8");
  assert.match(calendar, /tournament-planning-visual/);
  assert.match(calendar, /Work backward from the guest moment/);
  assert.match(tiers, /recipient-tier-visual/);
  assert.match(tiers, /One design family\. Four different jobs/);
});

test("makes product families the measurable, lazy-loaded homepage entry path in every locale", async () => {
  const homeRoutes = [siteRoutes.home, siteRoutes.koHome, siteRoutes.frCaHome, siteRoutes.jaHome, siteRoutes.deHome];
  const gatewaySource = await readFile(new URL("../src/ProductPriorityGateway.jsx", import.meta.url), "utf8");
  assert.match(gatewaySource, /product_family_click/);
  assert.match(gatewaySource, /loading="lazy"/);
  assert.match(gatewaySource, /decoding="async"/);
  assert.match(gatewaySource, /<picture>/);
  assert.match(gatewaySource, /type="image\/avif"/);
  assert.match(gatewaySource, /type="image\/webp"/);
  assert.match(gatewaySource, /productImageWidths = \[360, 720, 1122\]/);

  for (const route of homeRoutes) {
    const relativePath = route.path === "/" ? "" : route.path.slice(1);
    const document = await readFile(new URL(`../dist/client/${relativePath}index.html`, import.meta.url), "utf8");
    assert.match(document, /home-product-priority/);
    assert.match(document, /loading="lazy"/);
    const graph = JSON.parse(document.match(/<script id="zhoni-page-schema" type="application\/ld\+json">([\s\S]*?)<\/script>/)[1])["@graph"];
    const productList = graph.find(entity => entity["@type"] === "ItemList" && entity["@id"]?.endsWith("#product-families"));
    assert.ok(productList, `Expected homepage product ItemList for ${route.path}.`);
    assert.equal(productList.itemListElement.length, 6);
    assert.ok(productList.itemListElement.every(item => item.url.startsWith("https://zhonigolf.com/")));
  }
});

test("prioritizes only the homepage hero image and defers legacy below-the-fold imagery", async () => {
  const document = await readFile(new URL("../dist/client/index.html", import.meta.url), "utf8");
  const appSource = await readFile(new URL("../src/App.jsx", import.meta.url), "utf8");
  const hero = document.match(/<div class="hero-image">([\s\S]*?)<\/div>/)?.[1] ?? "";
  assert.match(hero, /<picture>/);
  assert.match(hero, /type="image\/avif"/);
  assert.match(hero, /type="image\/webp"/);
  assert.match(hero, /640w[\s\S]*1024w[\s\S]*1672w/);
  assert.match(hero, /<img[^>]+loading="eager"[^>]+fetchpriority="high"/i);
  assert.doesNotMatch(hero, /<video/i, "SSR must not make mobile or constrained clients discover a hero video.");
  assert.match(appSource, /navigator\.connection/);
  assert.match(appSource, /connection\?\.saveData/);
  assert.match(appSource, /"slow-2g", "2g", "3g"/);
  assert.match(appSource, /prefers-reduced-motion: reduce/);
  assert.match(appSource, /max-width: 900px/);
  assert.match(appSource, /video\.pause\(\)/);

  const responsiveImages = [
    ["zhoni-golf-collection-hero-v2", [640, 1024, 1672]],
    ["zhoni-product-headcovers-v3", [360, 720, 1122]],
    ["zhoni-plush-novelty-headcovers-v1", [360, 720, 1122]],
    ["zhoni-product-caps-v3", [360, 720, 1122]],
    ["zhoni-product-magnetic-towel-v4", [360, 720, 1122]],
    ["zhoni-product-ball-markers-v3", [360, 720, 1122]],
    ["zhoni-product-packaging-v3", [360, 720, 1122]],
  ];
  for (const [stem, widths] of responsiveImages) {
    for (const width of widths) {
      await access(new URL(`../public/assets/images/responsive/${stem}-${width}.avif`, import.meta.url));
      await access(new URL(`../public/assets/images/responsive/${stem}-${width}.webp`, import.meta.url));
    }
  }

  for (const className of ["showcase shell", "evidence"]) {
    const section = document.match(new RegExp(`<section class="${className}"[\\s\\S]*?<\\/section>`))?.[0] ?? "";
    assert.ok(section, `Expected ${className} on the homepage.`);
    const images = [...section.matchAll(/<img\b[^>]*>/g)].map(match => match[0]);
    assert.ok(images.length > 0, `Expected images in ${className}.`);
    for (const image of images) {
      assert.match(image, /loading="lazy"/);
      assert.match(image, /decoding="async"/);
      assert.match(image, /fetchpriority="low"/i);
    }
  }
});
