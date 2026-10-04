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

test("emits the files required by Sites packaging", async () => {
  await access(new URL("../dist/client/index.html", import.meta.url));
  await access(new URL("../dist/server/index.js", import.meta.url));
  await access(new URL("../dist/.openai/hosting.json", import.meta.url));
});
