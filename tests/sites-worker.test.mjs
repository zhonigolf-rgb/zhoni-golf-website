import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";
import worker from "../worker/index.js";
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

test("emits the files required by Sites packaging", async () => {
  await access(new URL("../dist/client/index.html", import.meta.url));
  await access(new URL("../dist/server/index.js", import.meta.url));
  await access(new URL("../dist/.openai/hosting.json", import.meta.url));
});
