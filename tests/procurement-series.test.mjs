import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import test from "node:test";
import { stableHash, compareShape } from "../scripts/localization/engine.mjs";
import { parseArticle, nextTranslationState } from "../scripts/localization/prepare-procurement-series.mjs";
import { procurementSeries, seriesArticleKey, seriesCatalog } from "../src/content/procurement-series.js";
import { procurementSeriesMeta } from "../src/content/procurement-series-meta.js";
import { procurementArticleRoutes } from "../src/content/procurement-article-meta.js";
import { findRoute, siteRoutes } from "../src/siteRoutes.js";

const locales = ["en","ko","fr-CA","ja","de"];
const load = async path => JSON.parse(await readFile(new URL(path,import.meta.url),"utf8"));
const copies = Object.fromEntries(await Promise.all(locales.map(async locale => [locale, await load(`../src/content/procurement-series/${locale}.json`)])));
const state = await load("../scripts/localization/state/procurement-series.json");
const prefix = locale => locale === "en" ? "" : `/${locale.toLowerCase()}`;
const escape = text => text.replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#x27;");

test("source Markdown, generated articles and accepted English revisions stay aligned", async () => {
  for (const locale of locales) {
    const dir = new URL(`../content/procurement-series/${locale}/`,import.meta.url);
    const files = (await readdir(dir)).filter(file=>file.endsWith(".md")).sort();
    assert.equal(files.length,5);
    for (const [i,key] of Object.keys(procurementSeries).entries()) {
      const markdown = await readFile(new URL(files[i],dir),"utf8");
      const {article,meta} = parseArticle(markdown);
      assert.deepEqual(article,copies[locale].articles[key],`${locale}/${key}: regenerate the source`);
      assert.equal(meta.seo_title,procurementSeriesMeta[locale][key].title);
      if (locale === "en") {
        const body = markdown.split("<!-- ARTICLE START -->")[1].split("<!-- ARTICLE END -->")[0];
        assert.ok(body.length >= 12000,`${key}: English article length`);
      } else {
        assert.equal(state[locale][key].sourceHash,stableHash(copies.en.articles[key]),`${locale}/${key}: English changed; update the translation`);
        assert.equal(state[locale][key].targetHash,stableHash(article),`${locale}/${key}: target revision`);
      }
      // Keep topic coverage and FAQ count; native prose may use different paragraph lengths.
      const structure = a => ({ sections:a.sections.map(s=>({title:s.title})), faqs:a.faqs });
      assert.deepEqual(compareShape(structure(copies.en.articles[key]),structure(article)),[],`${locale}/${key}`);
      assert.ok(article.sections.every(s=>s.title && (s.paragraphs.length || s.table?.rows.length || s.after?.length)));
    }
  }
});

test("preparation never marks unchanged translations current after a text-only English edit", () => {
  const previous = {sourceHash:"english-old",targetHash:"translation-old"};
  assert.deepEqual(nextTranslationState(previous,"english-new","translation-old"),previous);
  assert.deepEqual(nextTranslationState(previous,"english-new","translation-new"),{sourceHash:"english-new",targetHash:"translation-new"});
});

test("25 article pages expose localized navigation, FAQs, product links and inquiry context", async () => {
  const routes = Object.values(siteRoutes).filter(seriesArticleKey);
  assert.equal(routes.length,25);
  const sitemap = await readFile(new URL("../public/sitemap.xml",import.meta.url),"utf8");
  for (const route of routes) {
    const locale = route.lang ?? "en", key = seriesArticleKey(route);
    const article = copies[locale].articles[key], config = procurementSeries[key];
    const base = await load(`../src/content/procurement-articles/${locale}.json`);
    const html = await readFile(new URL(`../dist/client${route.path}index.html`,import.meta.url),"utf8");
    assert.ok(html.includes(`<h1>${escape(article.title)}</h1>`),route.path);
    assert.equal((html.match(/<h1(?:\s|>)/g)??[]).length,1,route.path);
    assert.equal((html.match(/class="procurement-article-section"/g)??[]).length,article.sections.length);
    for (const section of article.sections) assert.ok(html.includes(`<h2>${escape(section.title)}</h2>`));
    const graph = JSON.parse(html.match(/<script id="zhoni-page-schema" type="application\/ld\+json">([\s\S]*?)<\/script>/)[1])["@graph"];
    assert.ok(graph.some(node=>node["@type"]==="Article"));
    assert.deepEqual(graph.find(node=>node["@type"]==="FAQPage").mainEntity.map(q=>[q.name,q.acceptedAnswer.text]),article.faqs);
    assert.ok(html.includes(`rel="canonical" href="https://zhonigolf.com${route.path}"`));
    for (const other of locales) assert.ok(html.includes(`hreflang="${other}" href="https://zhonigolf.com${prefix(other)}/guides/${config.slug}/"`),`${route.path}: ${other}`);
    assert.ok(sitemap.includes(`<loc>https://zhonigolf.com${route.path}</loc>`));
    const hub = await readFile(new URL(`../dist/client${prefix(locale)}/guides/index.html`,import.meta.url),"utf8");
    assert.ok(hub.includes(`href="${route.path}"`));
    assert.ok(seriesCatalog(locale).some(item=>item.href===route.path));
    const productPath = `${prefix(locale)}${procurementArticleRoutes[config.family].product}`;
    assert.ok(html.includes(`href="${productPath}"`));
    const product = await readFile(new URL(`../dist/client${productPath}index.html`,import.meta.url),"utf8");
    assert.ok(product.includes(`href="${route.path}"`));
    for (const match of html.matchAll(/<a\b[^>]*href="([^"]+)"/g)) {
      const url = new URL(match[1].replaceAll("&amp;","&"),"https://zhonigolf.com");
      if (url.origin !== "https://zhonigolf.com") continue;
      if (url.pathname.endsWith("/request-a-quote/") && url.searchParams.has("product")) {
        assert.equal(url.pathname,`${prefix(locale)}/request-a-quote/`);
        assert.equal(url.searchParams.get("product"),base.products[config.family]);
      }
      if (locale !== "en" && /\/(?:guides|custom-golf|custom-plush)/.test(url.pathname)) assert.ok(url.pathname.startsWith(prefix(locale)+"/"),`${route.path}: ${url.pathname}`);
    }
    assert.equal(findRoute(route.path),route);
  }
});
