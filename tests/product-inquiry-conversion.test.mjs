import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { resolveInquiryProject } from "../src/inquiryPrefill.js";
import { schemaForRoute } from "../src/seo.js";
import { siteRoutes } from "../src/siteRoutes.js";

const appSource = await readFile(new URL("../src/App.jsx", import.meta.url), "utf8");
const ballMarkerSource = await readFile(new URL("../src/BallMarkerProductPage.jsx", import.meta.url), "utf8");
const plushSource = await readFile(new URL("../src/LocalizedPlushHeadcovers.jsx", import.meta.url), "utf8");
const audit = await readFile(new URL("../tools/product-inquiry-audit.md", import.meta.url), "utf8");
const keywordMatrix = await readFile(new URL("../tools/product-keyword-page-matrix.csv", import.meta.url), "utf8");
const seoAcceptance = await readFile(new URL("../tools/product-seo-acceptance.csv", import.meta.url), "utf8");
const sitemap = await readFile(new URL("../public/sitemap.xml", import.meta.url), "utf8");

test("publishes decision-ready inquiry content for the six priority products", () => {
  assert.match(appSource, /BUILD THE TOWEL SPECIFICATION/);
  assert.match(appSource, /BUILD THE PACKAGING SPECIFICATION/);
  assert.match(ballMarkerSource, /SAMPLE & QUALITY PATH/);
  assert.match(plushSource, /product_final_cta/);
  for (const route of ["Headcovers", "Plush headcovers", "Caps & visors", "Magnetic towels", "Ball markers & divot tools", "Packaging"]) {
    assert.match(audit, new RegExp(`\\| ${route.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")} \\|`));
  }
});

test("prefills ball-marker enquiries and carries product context through conversion events", () => {
  assert.equal(resolveInquiryProject(new URLSearchParams("product=Ball+markers+%26+divot+tools")), "Ball markers & divot tools");
  assert.equal(resolveInquiryProject(new URLSearchParams("product=Golf+Towels")), "Custom golf towels");
  assert.equal(resolveInquiryProject(new URLSearchParams("product=Custom+Packaging")), "Custom packaging");
  assert.equal(resolveInquiryProject(new URLSearchParams("product=Unknown")), "");
  for (const eventName of ["product_page_view", "quote_cta_click", "whatsapp_click", "email_click", "form_start", "form_submit_attempt", "generate_lead"]) {
    assert.match(appSource, new RegExp(`['\"]${eventName}['\"]`));
  }
  assert.match(appSource, /product_interest/);
});

test("keeps the internal keyword matrix mapped to public site routes", () => {
  const rows = keywordMatrix.trim().split(/\r?\n/);
  assert.ok(rows.length >= 20, "expected a useful set of high-intent keyword mappings");
  assert.match(rows[0], /primary_query/);
  for (const route of [
    "/custom-golf-headcovers/",
    "/custom-plush-golf-headcovers/",
    "/custom-golf-caps/",
    "/custom-golf-towels/",
    "/custom-golf-ball-markers-divot-tools/",
    "/custom-golf-packaging/",
  ]) assert.ok(keywordMatrix.includes(route), `missing keyword mapping for ${route}`);
});

test("assigns distinct commercial SEO targets and truthful service schema to priority products", () => {
  const routes = [siteRoutes.headcovers, siteRoutes.plushHeadcovers, siteRoutes.caps, siteRoutes.towels, siteRoutes.ballMarkers, siteRoutes.packaging];
  assert.equal(new Set(routes.map(route => route.title)).size, routes.length);
  for (const route of routes) {
    assert.ok(route.title.length <= 65, `${route.path} title is too long`);
    assert.ok(route.description.length >= 100 && route.description.length <= 180, `${route.path} description needs review`);
    assert.ok(seoAcceptance.includes(route.path), `missing acceptance row for ${route.path}`);
    const graph = schemaForRoute(route, [["Test question?", "A visible test answer."]])["@graph"];
    const service = graph.find(entity => entity["@type"] === "Service");
    assert.ok(service?.image?.startsWith("https://zhonigolf.com/assets/images/"), `missing service image for ${route.path}`);
    assert.ok(Array.isArray(service.category) && service.category.length >= 3, `missing service categories for ${route.path}`);
    assert.ok(!graph.some(entity => entity["@type"] === "Product"), `must not fabricate Product offers for ${route.path}`);
  }
});

test("publishes image discovery entries for all six priority products", () => {
  assert.match(sitemap, /xmlns:image="http:\/\/www\.google\.com\/schemas\/sitemap-image\/1\.1"/);
  for (const image of [
    "zhoni-product-headcovers-v3.png",
    "zhoni-plush-novelty-headcovers-v1.jpg",
    "zhoni-product-caps-v3.png",
    "zhoni-product-magnetic-towel-v4.png",
    "zhoni-product-ball-markers-v3.png",
    "zhoni-product-packaging-v3.png",
  ]) assert.match(sitemap, new RegExp(`<image:loc>https://zhonigolf\\.com/assets/images/${image.replace(".", "\\.")}</image:loc>`));
});
