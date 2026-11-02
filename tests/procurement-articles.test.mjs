import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { compareShape } from "../scripts/localization/engine.mjs";
import { procurementArticleKey, procurementArticleMeta, procurementArticleRoutes } from "../src/content/procurement-article-meta.js";
import { findRoute, siteRoutes } from "../src/siteRoutes.js";
import { resolveInquiryPlan } from "../src/content/product-plans.js";

const locales = ["en", "ko", "fr-CA", "ja", "de"];
const content = Object.fromEntries(await Promise.all(locales.map(async locale => {
  const raw = await readFile(new URL(`../src/content/procurement-articles/${locale}.json`, import.meta.url), "utf8");
  return [locale, JSON.parse(raw)];
})));
const escape = text => text.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#x27;");
const prefix = locale => locale === "en" ? "" : `/${locale === "fr-CA" ? "fr-ca" : locale}`;

test("all localized procurement articles retain the full approved content structure", () => {
  for (const locale of locales) {
    assert.deepEqual(compareShape(content.en, content[locale]), [], locale);
    assert.equal(content[locale].locale, locale);
    for (const [key, article] of Object.entries(content[locale].articles)) {
      assert.ok(article.sections.length >= 6);
      for (const section of article.sections) {
        assert.ok(section.title.trim());
        for (const p of [...(section.paragraphs ?? []), ...(section.after ?? [])]) assert.ok(p.trim());
      }
      assert.deepEqual(procurementArticleMeta[locale][key].length, 2);
      const canonical = procurementArticleRoutes[key].path;
      const route = findRoute(`${prefix(locale)}${canonical}`);
      assert.ok(route);
      assert.equal(procurementArticleKey(route), key);
      assert.equal(route.title, procurementArticleMeta[locale][key][0]);
      assert.equal(route.description, procurementArticleMeta[locale][key][1]);
      for (const [, path] of [...article.related, ...article.sections.filter(s => s.link).map(s => s.link)]) {
        assert.equal(findRoute(`${prefix(locale)}${path}`)?.lang ?? "en", locale);
        assert.ok(findRoute(`${prefix(locale)}${path}`), `${locale}: ${path}`);
      }
    }
  }
});

test("15 rendered articles publish full localized copy once, with matching FAQ and inquiry context", async () => {
  const routes = Object.values(siteRoutes).filter(procurementArticleKey);
  assert.equal(routes.length, 15);
  for (const route of routes) {
    const locale = route.lang ?? "en";
    const key = procurementArticleKey(route);
    const copy = content[locale];
    const article = copy.articles[key];
    const html = await readFile(new URL(`../dist/client${route.path}index.html`, import.meta.url), "utf8");
    assert.equal((html.match(/<h1(?:\s[^>]*)?>/g) ?? []).length, 1, route.path);
    assert.ok(html.includes(`<h1>${escape(article.title)}</h1>`), route.path);
    assert.equal(html.split(`data-procurement-article="${key}"`).length - 1, 1);
    assert.equal(html.split('class="procurement-article-section"').length - 1, article.sections.length);
    for (const p of [...article.intro, ...article.sections.flatMap(s => [...(s.paragraphs ?? []), ...(s.after ?? [])]), ...article.close.paragraphs]) {
      assert.ok(html.includes(escape(p)), `${route.path}: missing paragraph ${p.slice(0, 50)}`);
    }
    for (const section of article.sections) if (section.table) for (const row of section.table.rows) for (const cell of row) assert.ok(html.includes(escape(cell)));
    assert.doesNotMatch(html, /data-procurement-product=|class="guide-intro guide-answer-intro"/);
    assert.ok(html.includes('data-core-research="guide_to_product"'));
    assert.ok(html.includes(`href="${prefix(locale)}${procurementArticleRoutes[key].product}"`));
    const queryHref = html.match(/<a href="([^"]+)" data-analytics-placement="guide_final_cta"/)[1].replaceAll("&amp;", "&");
    const quote = new URL(queryHref, "https://zhonigolf.com");
    assert.equal(quote.pathname, `${prefix(locale)}/request-a-quote/`);
    assert.equal(quote.searchParams.get("product"), copy.products[key]);
    assert.equal(quote.searchParams.get("source"), route.source);
    if (key === "plush") assert.equal(quote.searchParams.get("headcover_type"), copy.plushType);
    assert.ok(resolveInquiryPlan(quote.searchParams, copy.products[key], locale));
    const graph = JSON.parse(html.match(/<script id="zhoni-page-schema" type="application\/ld\+json">([\s\S]*?)<\/script>/)[1])["@graph"];
    const faq = graph.find(node => node["@type"] === "FAQPage");
    assert.equal(faq.inLanguage, locale);
    assert.deepEqual(faq.mainEntity.map(item => [item.name, item.acceptedAnswer.text]), article.faqs);
    assert.ok(html.includes(`<title>${escape(route.title)}</title>`));
    assert.ok(html.includes(`rel="canonical" href="https://zhonigolf.com${route.path}"`));
    for (const otherLocale of locales) assert.ok(html.includes(`hreflang="${otherLocale}"`));
  }
});
