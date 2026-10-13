import test from "node:test";
import assert from "node:assert/strict";
import { compareShape, flattenStrings, loadAdapter, stableHash, validateAdapterQuality, validateLocaleLinks } from "../scripts/localization/engine.mjs";

test("flattenStrings exposes stable field paths", () => {
  const fields = flattenStrings({ title: "A", rows: [["B", "C"]] });
  assert.deepEqual([...fields], [["title", "A"], ["rows[0][0]", "B"], ["rows[0][1]", "C"]]);
});

test("compareShape finds missing localized fields", () => {
  assert.deepEqual(compareShape({ title: "A", copy: "B" }, { title: "가" }), ["copy: missing field"]);
});

test("locale links must remain inside the active locale", () => {
  const strings = new Map([["guides.items[0].href", "/guides/example/"], ["quoteHref", "/ko/request-a-quote/"]]);
  assert.deepEqual(validateLocaleLinks(strings, { pathPrefix: "/ko" }), ["guides.items[0].href: expected /ko/ locale path, found /guides/example/"]);
});

test("stableHash changes with the English source", () => {
  assert.notEqual(stableHash({ title: "A" }), stableHash({ title: "B" }));
});

test("adapter quality rules enforce SEO and preferred terminology", () => {
  const result = validateAdapterQuality({
    strings: new Map([["product.intro", "플러시 헤드커버를 정중하게 안내합니다."]]),
    adapter: {
      seoTerms: ["플러시 헤드커버", "마스코트 헤드커버"],
      terminology: { lining: "보호 안감" },
      allowedEnglishTerms: [],
      qualityRules: {}
    }
  });
  assert.deepEqual(result.errors, ["SEO term missing: 마스코트 헤드커버", "preferred terminology missing: 보호 안감"]);
});

test("adapter quality rules reject forbidden claims and English residue", () => {
  const result = validateAdapterQuality({
    strings: new Map([["product.copy", "Premium 제품이며 100% 보장합니다."]]),
    adapter: {
      seoTerms: [],
      terminology: {},
      allowedEnglishTerms: [],
      qualityRules: { englishResidue: "error", forbiddenTerms: ["100% 보장"] }
    }
  });
  assert.ok(result.errors.includes("forbidden term found: 100% 보장"));
  assert.ok(result.errors.some(error => error.includes("English residue") && error.includes("Premium")));
});

test("Latin-script adapters can disable the non-Latin English residue scanner", () => {
  const result = validateAdapterQuality({
    strings: new Map([["product.copy", "Veuillez transmettre votre fichier graphique."]]),
    adapter: {
      seoTerms: [],
      terminology: {},
      allowedEnglishTerms: [],
      qualityRules: { englishResidue: "off" }
    }
  });
  assert.deepEqual(result, { errors: [], warnings: [] });
});

test("adapter quality rules measure formal Korean tone", () => {
  const result = validateAdapterQuality({
    strings: new Map([
      ["product.copy", "프로젝트 조건과 제품 구조를 함께 검토한 뒤 적합한 사양을 안내합니다."],
      ["product.intro", "이 문장은 충분히 길지만 구매 담당자를 위한 정중한 종결 표현이 전혀 없음."]
    ]),
    adapter: {
      seoTerms: [],
      terminology: {},
      allowedEnglishTerms: [],
      qualityRules: { formalTone: { minChars: 20, minRatio: 0.75, endings: ["합니다"] } }
    }
  });
  assert.ok(result.errors.some(error => error.startsWith("formal tone coverage:")));
});

test("adapter quality rules enforce formal address groups and reject informal address", () => {
  const result = validateAdapterQuality({
    strings: new Map([["product.copy", "Du sendest dein Logo für die Prüfung."]]),
    adapter: {
      seoTerms: [],
      terminology: {},
      allowedEnglishTerms: [],
      qualityRules: {
        requiredTermGroups: [{ label: "formelle Sie-Ansprache", terms: ["Sie", "Ihre"], minOccurrences: 1 }],
        forbiddenPatterns: [{ label: "informelle Du-Ansprache", pattern: /\b(?:du|dein)\b/iu }]
      }
    }
  });
  assert.ok(result.errors.includes("required term group formelle Sie-Ansprache: expected at least 1, found 0"));
  assert.ok(result.errors.includes("forbidden language pattern found: informelle Du-Ansprache"));
});

test("French Canadian, Japanese and German adapters define locale-specific quality rules", async () => {
  const adapters = await Promise.all([loadAdapter("fr-CA"), loadAdapter("ja"), loadAdapter("de")]);
  for (const adapter of adapters) {
    assert.ok(adapter.tone.length > 30);
    assert.ok(adapter.seoTerms.length >= 4);
    assert.ok(Object.keys(adapter.terminology).length >= 8);
    assert.ok(adapter.qualityRules.requiredTerms.length >= 3);
    assert.equal(adapter.requiredAlternatePaths.length, 5);
  }
  assert.ok(adapters[0].qualityRules.requiredTermGroups.some(group => group.label.includes("vouvoiement")));
  assert.equal(adapters[0].qualityRules.englishResidue, "off");
  assert.equal(adapters[1].qualityRules.englishResidue, "error");
  assert.equal(adapters[2].qualityRules.englishResidue, "off");
  assert.ok(adapters[2].qualityRules.forbiddenPatterns.some(rule => rule.label.includes("Du-Ansprache")));
});
