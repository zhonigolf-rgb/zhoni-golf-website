#!/usr/bin/env node
/**
 * Portable localization adapter kit (Node.js 18+; no npm dependencies).
 *
 * CLI:
 *   node localization-adapter-kit.mjs --source content/en.json --target content/ja.json --locale ja --prefix /ja
 *
 * Optional project profile:
 *   --profile localization-profile.json
 *
 * Profile fields may include: seoTerms, terminology, allowedEnglishTerms and
 * qualityRules.requiredTerms / forbiddenTerms / requiredTermGroups /
 * forbiddenPatterns. Regex patterns in JSON use { label, pattern, flags }.
 *
 * Programmatic interface:
 *   import { auditLocalization, getLocaleAdapter } from "./localization-adapter-kit.mjs";
 */

import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const adapters = {
  ko: {
    locale: "ko",
    displayName: "한국어",
    pathPrefix: "/ko",
    allowedEnglishTerms: ["B2B", "MOQ", "OEM", "WhatsApp", "DHL", "FedEx"],
    qualityRules: {
      englishResidue: "error",
      forbiddenTerms: ["무조건 최저가", "완벽한 품질", "100% 보장", "100％ 보장"],
      formalTone: {
        minChars: 35,
        minRatio: 0.8,
        endings: ["니다", "주세요", "하세요", "인가요", "한가요", "되나요", "있나요", "없나요", "나요", "까요"]
      }
    }
  },
  "fr-CA": {
    locale: "fr-CA",
    displayName: "Français (Canada)",
    pathPrefix: "/fr-ca",
    allowedEnglishTerms: ["B2B", "MOQ", "OEM", "WhatsApp", "golf", "DHL", "FedEx"],
    qualityRules: {
      englishResidue: "off",
      forbiddenTerms: ["prix le plus bas garanti", "qualité parfaite", "garanti à 100 %"],
      forbiddenPatterns: [
        { label: "tutoiement informel", pattern: /(?<!\p{L})(?:tu|ton|ta|tes)(?!\p{L})/iu },
        { label: "anglais non localisé", pattern: /\b(?:request a quote|shipping destination)\b/iu }
      ]
    }
  },
  ja: {
    locale: "ja",
    displayName: "日本語",
    pathPrefix: "/ja",
    allowedEnglishTerms: ["B2B", "MOQ", "OEM", "WhatsApp", "DHL", "FedEx"],
    qualityRules: {
      englishResidue: "error",
      forbiddenTerms: ["激安", "絶対に", "最高品質", "100％保証", "100%保証", "あなた"],
      formalTone: {
        minChars: 30,
        minRatio: 0.8,
        endings: ["です", "ます", "ください", "でしょうか", "ですか", "ますか"]
      }
    }
  },
  de: {
    locale: "de",
    displayName: "Deutsch",
    pathPrefix: "/de",
    allowedEnglishTerms: ["B2B", "MOQ", "OEM", "WhatsApp", "Golf", "DHL", "FedEx"],
    qualityRules: {
      englishResidue: "off",
      forbiddenTerms: ["garantiert niedrigster Preis", "perfekte Qualität", "100 % garantiert"],
      forbiddenPatterns: [
        { label: "informelle Du-Ansprache", pattern: /(?<!\p{L})(?:du|dein|deine|deinen|deinem|euch|euer|eure)(?!\p{L})/iu },
        { label: "unübersetzte englische Handlungsaufforderung", pattern: /\b(?:request a quote|start your project|shipping destination)\b/iu }
      ]
    }
  }
};

export function stableHash(value) {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex").slice(0, 16);
}

export function flattenStrings(value, prefix = "", result = new Map()) {
  if (typeof value === "string") {
    result.set(prefix, value);
    return result;
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => flattenStrings(item, `${prefix}[${index}]`, result));
    return result;
  }
  if (value && typeof value === "object") {
    Object.entries(value).forEach(([key, item]) => flattenStrings(item, prefix ? `${prefix}.${key}` : key, result));
  }
  return result;
}

export function compareShape(source, target, prefix = "", errors = [], ignoredKeys = new Set(["locale"])) {
  const sourceArray = Array.isArray(source);
  const targetArray = Array.isArray(target);
  if (sourceArray !== targetArray || typeof source !== typeof target || (source === null) !== (target === null)) {
    errors.push(`${prefix || "root"}: type mismatch`);
    return errors;
  }
  if (sourceArray) {
    if (source.length !== target.length) errors.push(`${prefix}: expected ${source.length} items, found ${target.length}`);
    source.forEach((item, index) => {
      if (index < target.length) compareShape(item, target[index], `${prefix}[${index}]`, errors, ignoredKeys);
    });
    return errors;
  }
  if (source && typeof source === "object") {
    for (const key of Object.keys(source)) {
      if (!prefix && ignoredKeys.has(key)) continue;
      const childPath = prefix ? `${prefix}.${key}` : key;
      if (!(key in target)) errors.push(`${childPath}: missing field`);
      else compareShape(source[key], target[key], childPath, errors, ignoredKeys);
    }
    for (const key of Object.keys(target)) {
      if (!prefix && ignoredKeys.has(key)) continue;
      if (!(key in source)) errors.push(`${prefix ? `${prefix}.` : ""}${key}: unexpected field`);
    }
  }
  return errors;
}

function mergeRules(base = {}, extra = {}) {
  const listKeys = ["requiredTerms", "requiredTermGroups", "forbiddenTerms", "forbiddenPatterns"];
  const merged = { ...base, ...extra };
  for (const key of listKeys) merged[key] = [...(base[key] ?? []), ...(extra[key] ?? [])];
  return merged;
}

export function getLocaleAdapter(locale, profile = {}, pathPrefix) {
  const base = adapters[locale];
  if (!base) throw new Error(`Unsupported locale: ${locale}. Use ko, fr-CA, ja or de.`);
  return {
    ...base,
    ...profile,
    locale,
    pathPrefix: pathPrefix ?? profile.pathPrefix ?? base.pathPrefix,
    seoTerms: [...(base.seoTerms ?? []), ...(profile.seoTerms ?? [])],
    terminology: { ...(base.terminology ?? {}), ...(profile.terminology ?? {}) },
    allowedEnglishTerms: [...new Set([...(base.allowedEnglishTerms ?? []), ...(profile.allowedEnglishTerms ?? [])])],
    qualityRules: mergeRules(base.qualityRules, profile.qualityRules)
  };
}

function isSearchableField(field) {
  return !field.startsWith("images.") && !/(?:href|image|locale|cluster)$/i.test(field);
}

function countOccurrences(haystack, needle, caseSensitive = false, locale = "en") {
  if (!needle) return 0;
  const source = caseSensitive ? haystack : haystack.toLocaleLowerCase(locale);
  const term = caseSensitive ? needle : needle.toLocaleLowerCase(locale);
  return source.split(term).length - 1;
}

function endsWithAny(value, endings) {
  const normalized = value.trim().replace(/[.!?。！？]+$/, "");
  return endings.some(ending => normalized.endsWith(ending));
}

function validateLocaleLinks(strings, adapter) {
  const errors = [];
  for (const [field, value] of strings) {
    if (!/(?:href|url|path|quoteHref)$/i.test(field)) continue;
    if (!value.startsWith("/") || value.startsWith("/assets/")) continue;
    if (!value.startsWith(`${adapter.pathPrefix}/`) && value !== adapter.pathPrefix) {
      errors.push(`${field}: expected ${adapter.pathPrefix}/ locale path, found ${value}`);
    }
  }
  return errors;
}

function validateEnglishResidue(strings, adapter) {
  const warnings = [];
  const allowed = new Set((adapter.allowedEnglishTerms ?? []).map(term => term.toLowerCase()));
  for (const [field, value] of strings) {
    if (!isSearchableField(field) || /(?:alt|code|sku)$/i.test(field)) continue;
    const words = value.match(/[A-Za-z][A-Za-z&-]{3,}/g) ?? [];
    const unexpected = words.filter(word => !allowed.has(word.toLowerCase()));
    if (unexpected.length) warnings.push(`${field}: ${[...new Set(unexpected)].join(", ")}`);
  }
  return warnings;
}

function makePattern(rule) {
  if (rule.pattern instanceof RegExp) return rule.pattern;
  return new RegExp(rule.pattern, rule.flags ?? "u");
}

function validateQuality(strings, contextStrings, adapter) {
  const rules = adapter.qualityRules ?? {};
  const searchable = [...strings, ...contextStrings].filter(([field]) => isSearchableField(field));
  const corpus = searchable.map(([, value]) => value).join("\n");
  const folded = corpus.toLocaleLowerCase(adapter.locale);
  const errors = [];
  const warnings = [];

  for (const term of adapter.seoTerms ?? []) {
    if (!folded.includes(term.toLocaleLowerCase(adapter.locale))) errors.push(`SEO term missing: ${term}`);
  }
  for (const term of Object.values(adapter.terminology ?? {})) {
    if (!folded.includes(term.toLocaleLowerCase(adapter.locale))) errors.push(`preferred terminology missing: ${term}`);
  }
  for (const rule of rules.requiredTerms ?? []) {
    const found = countOccurrences(corpus, rule.term, rule.caseSensitive === true, adapter.locale);
    const minimum = rule.minOccurrences ?? 1;
    if (found < minimum) errors.push(`required term ${rule.term}: expected at least ${minimum}, found ${found}`);
  }
  for (const group of rules.requiredTermGroups ?? []) {
    const found = group.terms.reduce((sum, term) => sum + countOccurrences(corpus, term, group.caseSensitive === true, adapter.locale), 0);
    const minimum = group.minOccurrences ?? 1;
    if (found < minimum) errors.push(`required term group ${group.label}: expected at least ${minimum}, found ${found}`);
  }
  for (const term of rules.forbiddenTerms ?? []) {
    if (folded.includes(term.toLocaleLowerCase(adapter.locale))) errors.push(`forbidden term found: ${term}`);
  }
  for (const rule of rules.forbiddenPatterns ?? []) {
    if (makePattern(rule).test(corpus)) errors.push(`forbidden language pattern found: ${rule.label}`);
  }
  if (rules.formalTone) {
    const { endings = [], minChars = 35, minRatio = 0 } = rules.formalTone;
    const prose = [...strings].filter(([field, value]) => isSearchableField(field) && !/(?:alt|label|title|eyebrow|rail|caption|meta)$/i.test(field) && value.length >= minChars && /[.!?。！？]$/.test(value.trim()));
    const formal = prose.filter(([, value]) => endsWithAny(value, endings));
    const ratio = prose.length ? formal.length / prose.length : 1;
    if (ratio < minRatio) errors.push(`formal tone coverage: expected ${Math.round(minRatio * 100)}%, found ${Math.round(ratio * 100)}% (${formal.length}/${prose.length})`);
  }

  const residue = validateEnglishResidue(strings, adapter);
  if (rules.englishResidue === "error") errors.push(...residue.map(item => `English residue: ${item}`));
  else if (rules.englishResidue !== "off") warnings.push(...residue);
  return { errors, warnings };
}

export function auditLocalization({ source, target, locale, pathPrefix, profile = {}, context = {} }) {
  const adapter = getLocaleAdapter(locale, profile, pathPrefix);
  const strings = flattenStrings(target);
  const contextStrings = flattenStrings(context, "context");
  const errors = [
    ...compareShape(source, target),
    ...[...strings].filter(([, value]) => !value.trim()).map(([field]) => `${field}: empty string`),
    ...validateLocaleLinks(strings, adapter)
  ];
  const quality = validateQuality(strings, contextStrings, adapter);
  errors.push(...quality.errors);
  return {
    status: errors.length ? "failed" : "ready",
    locale,
    displayName: adapter.displayName,
    sourceHash: stableHash(source),
    stringCount: strings.size,
    errors,
    warnings: quality.warnings
  };
}

export function formatReport(report) {
  const heading = `${report.status === "ready" ? "PASS" : "FAIL"} ${report.locale} (${report.displayName}): ${report.stringCount} strings · source=${report.sourceHash}`;
  const details = [...report.errors.map(item => `ERROR ${item}`), ...report.warnings.map(item => `WARN ${item}`)];
  return details.length ? `${heading}\n${details.join("\n")}` : heading;
}

function parseArgs(argv) {
  const result = {};
  for (let index = 0; index < argv.length; index += 1) {
    const item = argv[index];
    if (!item.startsWith("--")) continue;
    const key = item.slice(2);
    const value = argv[index + 1];
    if (!value || value.startsWith("--")) throw new Error(`Missing value for --${key}`);
    result[key] = value;
    index += 1;
  }
  return result;
}

async function readJson(file) {
  return JSON.parse(await readFile(path.resolve(process.cwd(), file), "utf8"));
}

async function runCli() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.source || !args.target || !args.locale) {
    throw new Error("Usage: node localization-adapter-kit.mjs --source <en.json> --target <locale.json> --locale <ko|fr-CA|ja|de> [--prefix </locale>] [--profile <profile.json>] [--context <seo-or-routes.json>]");
  }
  const [source, target, profile, context] = await Promise.all([
    readJson(args.source),
    readJson(args.target),
    args.profile ? readJson(args.profile) : {},
    args.context ? readJson(args.context) : {}
  ]);
  const report = auditLocalization({ source, target, locale: args.locale, pathPrefix: args.prefix, profile, context });
  console.log(formatReport(report));
  if (report.status === "failed") process.exitCode = 1;
}

const isDirectRun = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isDirectRun) runCli().catch(error => {
  console.error(`FAIL: ${error.message}`);
  process.exitCode = 1;
});
