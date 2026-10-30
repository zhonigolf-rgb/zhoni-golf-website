import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { auditRelease } from "../scripts/release-audit.mjs";
import { productEntryDetails } from "../src/product-navigation.js";

const root = fileURLToPath(new URL("..", import.meta.url));

test("classifies all localized core product clicks consistently", () => {
  for (const [prefix, language] of [["", "en"], ["/ko", "ko"], ["/fr-ca", "fr-CA"], ["/ja", "ja"], ["/de", "de"]]) {
    for (const [slug,family] of [["custom-golf-towels", "towels"], ["custom-golf-caps", "caps"], ["custom-plush-golf-headcovers", "plush"]]) {
      const details = productEntryDetails({title:slug,href:`${prefix}/${slug}/`}, {pagePath:`${prefix}/`,language,placement:"homepage_core",position:1});
      assert.equal(details.product_group,"core");
      assert.equal(details.product_family,family);
      assert.equal(details.page_language,language);
      assert.equal(details.placement,"homepage_core");
    }
    assert.equal(productEntryDetails({title:"Marker",href:`${prefix}/custom-golf-ball-markers-divot-tools/`},{pagePath:`${prefix}/`,language,placement:"supporting_products"}).product_group,"supporting");
  }
});

test("release audit verifies all routes and the reciprocal core guide network", () => {
  const report = auditRelease(root);
  assert.deepEqual(report.failures,[]);
  assert.equal(report.status,"PASS");
  assert.equal(report.stats.routes,325);
  assert.equal(report.stats.coreProducts,15);
  assert.equal(report.stats.guideReturnLinks,50);
  assert.equal(report.stats.planLinks,50);
});

test("release audit rejects broken links, missing assets, bad canonicals and schema", () => {
  const report = auditRelease(root, {readHtml(file,route) {
    let html = readFileSync(file,"utf8");
    if (route.path === "/") html = html.replace('href="https://zhonigolf.com/"','href="https://zhonigolf.com/wrong/"')
      .replace('href="/custom-golf-towels/"','href="/missing-product/"')
      .replace('id="zhoni-page-schema" type="application/ld+json">','id="zhoni-page-schema" type="application/ld+json">BROKEN')
      .replace(/(<img\b[^>]*src=")[^"]+/, '$1/assets/missing-test-image.png');
    return html;
  }});
  assert.equal(report.status,"FAIL");
  for (const message of ["Wrong canonical", "Broken internal link", "Missing local asset", "Invalid structured data"]) assert.ok(report.failures.some(failure=>failure.includes(message)),message);
});
