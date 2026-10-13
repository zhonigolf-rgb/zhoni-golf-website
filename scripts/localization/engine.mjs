import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const moduleDir = path.dirname(fileURLToPath(import.meta.url));
export const projectRoot = path.resolve(moduleDir, "../..");

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

export function compareShape(source, target, prefix = "", errors = []) {
  const sourceArray = Array.isArray(source);
  const targetArray = Array.isArray(target);
  if (sourceArray !== targetArray || typeof source !== typeof target || (source === null) !== (target === null)) {
    errors.push(`${prefix || "root"}: type mismatch`);
    return errors;
  }
  if (sourceArray) {
    if (source.length !== target.length) errors.push(`${prefix}: expected ${source.length} items, found ${target.length}`);
    source.forEach((item, index) => {
      if (index < target.length) compareShape(item, target[index], `${prefix}[${index}]`, errors);
    });
    return errors;
  }
  if (source && typeof source === "object") {
    for (const key of Object.keys(source)) {
      const childPath = prefix ? `${prefix}.${key}` : key;
      if (!(key in target)) errors.push(`${childPath}: missing field`);
      else compareShape(source[key], target[key], childPath, errors);
    }
    for (const key of Object.keys(target)) {
      if (!(key in source)) errors.push(`${prefix ? `${prefix}.` : ""}${key}: unexpected field`);
    }
  }
  return errors;
}

export function validateLocaleLinks(strings, adapter) {
  const errors = [];
  for (const [field, value] of strings) {
    if (!/(?:href|quoteHref)$/i.test(field)) continue;
    if (!value.startsWith("/") || value.startsWith("/assets/")) continue;
    if (!value.startsWith(`${adapter.pathPrefix}/`) && value !== adapter.pathPrefix) {
      errors.push(`${field}: expected ${adapter.pathPrefix}/ locale path, found ${value}`);
    }
  }
  return errors;
}

export function validateEnglishResidue(strings, adapter) {
  const warnings = [];
  const allowed = new Set(adapter.allowedEnglishTerms.map(term => term.toLowerCase()));
  for (const [field, value] of strings) {
    if (field.startsWith("images.") || /(?:href|image|alt|locale|cluster)$/i.test(field)) continue;
    const words = value.match(/[A-Za-z][A-Za-z&-]{3,}/g) ?? [];
    const unexpected = words.filter(word => !allowed.has(word.toLowerCase()));
    if (unexpected.length) warnings.push(`${field}: ${[...new Set(unexpected)].join(", ")}`);
  }
  return warnings;
}

function countOccurrences(haystack, needle) {
  if (!needle) return 0;
  return haystack.split(needle).length - 1;
}

function countTerms(corpus, terms, caseSensitive = true) {
  const source = caseSensitive ? corpus : corpus.toLocaleLowerCase();
  return terms.reduce((total, term) => total + countOccurrences(source, caseSensitive ? term : term.toLocaleLowerCase()), 0);
}

function isSearchableField(field) {
  return !field.startsWith("images.") && !/(?:href|image|locale|cluster)$/i.test(field);
}

function endsWithAny(value, endings) {
  const normalized = value.trim().replace(/[.!?。！？]+$/, "");
  return endings.some(ending => normalized.endsWith(ending));
}

export function validateAdapterQuality({ strings, routeStrings = new Map(), adapter }) {
  const rules = adapter.qualityRules ?? {};
  const searchable = [...strings, ...routeStrings].filter(([field]) => isSearchableField(field));
  const corpus = searchable.map(([, value]) => value).join("\n");
  const foldedCorpus = corpus.toLocaleLowerCase(adapter.locale);
  const errors = [];
  const warnings = [];

  for (const term of adapter.seoTerms ?? []) {
    if (!foldedCorpus.includes(term.toLocaleLowerCase(adapter.locale))) errors.push(`SEO term missing: ${term}`);
  }

  for (const term of Object.values(adapter.terminology ?? {})) {
    if (!foldedCorpus.includes(term.toLocaleLowerCase(adapter.locale))) errors.push(`preferred terminology missing: ${term}`);
  }

  for (const rule of rules.requiredTerms ?? []) {
    const found = countOccurrences(corpus, rule.term);
    const minimum = rule.minOccurrences ?? 1;
    if (found < minimum) errors.push(`required term ${rule.term}: expected at least ${minimum}, found ${found}`);
  }

  for (const group of rules.requiredTermGroups ?? []) {
    const found = countTerms(corpus, group.terms, group.caseSensitive !== false);
    const minimum = group.minOccurrences ?? 1;
    if (found < minimum) errors.push(`required term group ${group.label}: expected at least ${minimum}, found ${found}`);
  }

  for (const term of rules.forbiddenTerms ?? []) {
    if (corpus.includes(term)) errors.push(`forbidden term found: ${term}`);
  }

  for (const rule of rules.forbiddenPatterns ?? []) {
    const pattern = rule.pattern instanceof RegExp ? rule.pattern : new RegExp(rule.pattern, rule.flags ?? "u");
    if (pattern.test(corpus)) errors.push(`forbidden language pattern found: ${rule.label}`);
  }

  if (rules.formalTone) {
    const { endings = [], minChars = 40, minRatio = 0 } = rules.formalTone;
    const prose = [...strings]
      .filter(([field, value]) => isSearchableField(field) && !/(?:alt|label|title|eyebrow|rail|caption|meta)$/i.test(field) && value.length >= minChars && /[.!?。！？]$/.test(value.trim()))
      .map(([field, value]) => ({ field, value }));
    const formal = prose.filter(({ value }) => endsWithAny(value, endings));
    const ratio = prose.length ? formal.length / prose.length : 0;
    if (ratio < minRatio) {
      const examples = prose.filter(({ value }) => !endsWithAny(value, endings)).slice(0, 5).map(({ field }) => field).join(", ");
      errors.push(`formal tone coverage: expected ${Math.round(minRatio * 100)}%, found ${Math.round(ratio * 100)}% (${formal.length}/${prose.length}); review ${examples}`);
    }
  }

  const residue = validateEnglishResidue(strings, adapter);
  if (rules.englishResidue === "error") errors.push(...residue.map(item => `English residue: ${item}`));
  else if (rules.englishResidue !== "off") warnings.push(...residue);

  return { errors, warnings };
}

async function readJson(file) {
  return JSON.parse(await readFile(file, "utf8"));
}

export async function loadAdapter(locale) {
  const file = path.join(moduleDir, "adapters", `${locale}.mjs`);
  return (await import(pathToFileURL(file))).default;
}

export async function analyzeLocalization({ locale, cluster = "plush-headcovers" }) {
  const adapter = await loadAdapter(locale);
  const sourceFile = path.join(projectRoot, "src", "content", cluster, "en.json");
  const targetFile = path.join(projectRoot, "src", "content", cluster, `${locale}.json`);
  const stateFile = path.join(moduleDir, "state", `${locale}.${cluster}.json`);
  const source = await readJson(sourceFile);
  const { siteRoutes } = await import(pathToFileURL(path.join(projectRoot, "src", "siteRoutes.js")));
  let target;
  try {
    target = await readJson(targetFile);
  } catch (error) {
    if (error.code === "ENOENT" && adapter.allowPending) return { status: "pending", locale, cluster, adapter };
    throw error;
  }
  let state = {};
  try { state = await readJson(stateFile); } catch (error) { if (error.code !== "ENOENT") throw error; }

  const strings = flattenStrings(target);
  const missing = [...strings].filter(([, value]) => !value.trim()).map(([field]) => `${field}: empty string`);
  const shapeErrors = compareShape(source, target).filter(error => !/^locale:/.test(error));
  const linkErrors = validateLocaleLinks(strings, adapter);
  const knownPaths = new Set(Object.values(siteRoutes).map(route => route.path));
  const routeErrors = [];
  const localizedRoutes = [];
  for (const alternatePath of adapter.requiredAlternatePaths) {
    const route = Object.values(siteRoutes).find(item => item.lang === locale && item.alternatePath === alternatePath);
    if (!route) routeErrors.push(`route missing for ${alternatePath}`);
    else localizedRoutes.push(route);
  }
  for (const [field, value] of strings) {
    if (!/(?:href|quoteHref)$/i.test(field) || !value.startsWith("/")) continue;
    const routePath = value.split("?")[0];
    if (!knownPaths.has(routePath)) routeErrors.push(`${field}: route not registered (${routePath})`);
  }
  const routeStrings = flattenStrings(localizedRoutes, "routes");
  const quality = validateAdapterQuality({ strings, routeStrings, adapter });
  const sourceHash = stableHash(source);
  const stale = state.sourceHash !== sourceHash;
  const errors = [...shapeErrors, ...missing, ...linkErrors, ...routeErrors, ...quality.errors];
  return {
    status: errors.length ? "failed" : "ready",
    locale,
    cluster,
    adapter,
    sourceHash,
    acceptedHash: state.sourceHash ?? null,
    stale,
    errors,
    warnings: quality.warnings,
    stringCount: strings.size,
    pageCount: 1 + Object.keys(target.guides.topics).length,
    sourceFile,
    targetFile
  };
}

export function formatReport(report) {
  if (report.status === "pending") return `PENDING ${report.locale}: content not created (${report.adapter.displayName})`;
  const base = `${report.status === "ready" ? "PASS" : "FAIL"} ${report.locale}: ${report.pageCount} pages · ${report.stringCount} strings · stale=${report.stale ? "yes" : "no"}`;
  const details = [...report.errors.map(item => `ERROR ${item}`), ...report.warnings.map(item => `WARN ${item}`)];
  return details.length ? `${base}\n${details.join("\n")}` : base;
}
