import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { siteRoutes } from "../src/siteRoutes.js";
import { coreProductGuidePaths } from "../src/product-navigation.js";
import { resolveInquiryPlan } from "../src/content/product-plans.js";

export function auditRelease(root, { readHtml = file => readFileSync(file, "utf8") } = {}) {
  const failures = [];
  const routes = Object.values(siteRoutes);
  const routePaths = new Set(routes.map(route => route.path));
  const documents = new Map();
  const stats = { routes: routes.length, internalLinks: 0, localAssets: 0, coreProducts: 0, guideReturnLinks: 0, planLinks: 0 };
  const fail = (route, message) => failures.push(`${route}: ${message}`);
  const load = route => {
    const file = path.join(root, "dist/client", route.path, "index.html");
    if (!existsSync(file)) { fail(route.path, "Missing prerendered HTML"); return ""; }
    return readHtml(file, route);
  };
  for (const route of routes) documents.set(route.path, load(route));
  for (const route of routes) {
    const html = documents.get(route.path);
    if (!html) continue;
    if ([...html.matchAll(/<h1(?:\s|>)/g)].length !== 1) fail(route.path, "Expected exactly one H1");
    if (!html.includes(`<html lang="${route.lang ?? "en"}">`)) fail(route.path, "Wrong document language");
    if (!html.includes(`<link rel="canonical" href="https://zhonigolf.com${route.path}"`)) fail(route.path, "Wrong canonical");
    try {
      const json = html.match(/<script id="zhoni-page-schema" type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1];
      if (!Array.isArray(JSON.parse(json)["@graph"])) fail(route.path, "Missing schema graph");
    } catch { fail(route.path, "Invalid structured data"); }
    for (const match of html.matchAll(/<a\b[^>]*href="([^"]+)"/g)) {
      let url;
      try { url = new URL(match[1].replaceAll("&amp;", "&"), `https://zhonigolf.com${route.path}`); }
      catch { fail(route.path, "Invalid anchor URL"); continue; }
      if (url.origin !== "https://zhonigolf.com") continue;
      stats.internalLinks++;
      if (!routePaths.has(url.pathname) && !existsSync(path.join(root, "public", decodeURIComponent(url.pathname))) && !existsSync(path.join(root, "dist/client", decodeURIComponent(url.pathname)))) fail(route.path, `Broken internal link ${url.pathname}`);
      if (url.searchParams.has("plan")) {
        stats.planLinks++;
        const value = resolveInquiryPlan(url.searchParams, "", route.lang ?? "en");
        if (!value.includes(url.searchParams.get("plan")) || value.length > 140) fail(route.path, "Invalid inquiry plan prefill");
      }
    }
    for (const match of html.matchAll(/<(?:img|script|source)\b[^>]*\b(?:src|srcSet|srcset)="([^"]+)"/g)) {
      for (const entry of match[1].split(",")) {
        const src = entry.trim().split(/\s+/)[0];
        if (!src.startsWith("/")) continue;
        stats.localAssets++;
        const pathname = new URL(src, "https://zhonigolf.com").pathname;
        if (!existsSync(path.join(root, "public", pathname)) && !existsSync(path.join(root, "dist/client", pathname))) fail(route.path, `Missing local asset ${pathname}`);
      }
    }
  }
  for (const prefix of ["", "/ko", "/fr-ca", "/ja", "/de"]) {
    const home = documents.get(`${prefix}/`) ?? "";
    const core = home.match(/<div id="core-products"[\s\S]*?<\/section>/)?.[0] ?? "";
    if ([...core.matchAll(/class="family-card"/g)].length !== 3) fail(`${prefix}/`, "Expected three core product cards");
    for (const [product, guides] of Object.entries(coreProductGuidePaths)) {
      const productPath = `${prefix}${product}`;
      const html = documents.get(productPath) ?? "";
      stats.coreProducts++;
      if (!core.includes(`href="${productPath}"`)) fail(`${prefix}/`, `Missing core entry ${productPath}`);
      if (!html.includes('data-core-research="product_to_guide"')) fail(productPath, "Missing buyer-guide bridge");
      for (const guide of guides) {
        const guidePath = `${prefix}${guide}`;
        if (!html.includes(`href="${guidePath}"`)) fail(productPath, `Missing guide link ${guidePath}`);
        const guideHtml = documents.get(guidePath) ?? "";
        if (!guideHtml.includes('data-core-research="guide_to_product"') || !guideHtml.includes(`href="${productPath}"`)) fail(guidePath, `Missing return to ${productPath}`);
        stats.guideReturnLinks++;
      }
    }
  }
  if (stats.planLinks !== 50) fail("inquiry plans", `Expected 50 localized links, found ${stats.planLinks}`);
  return { status: failures.length ? "FAIL" : "PASS", stats, failures: [...new Set(failures)] };
}
