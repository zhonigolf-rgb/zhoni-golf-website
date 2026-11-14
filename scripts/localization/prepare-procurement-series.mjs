import { readFile, readdir, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { stableHash } from "./engine.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const locales = ["en", "ko", "fr-CA", "ja", "de"];
const keys = ["towelRange", "towelLogos", "capReorders", "capVersions", "mascotRange"];

export function parseArticle(markdown) {
  const front = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  const meta = Object.fromEntries((front?.[1] ?? "").split(/\r?\n/).filter(line => line.includes(":")).map(line => {
    const i = line.indexOf(":"); return [line.slice(0, i).trim(), line.slice(i + 1).trim()];
  }));
  const body = markdown.split("<!-- ARTICLE START -->")[1]?.split("<!-- ARTICLE END -->")[0];
  if (!body) throw new Error("Article markers missing");
  const blocks = body.trim().split(/\r?\n\s*\r?\n/).map(block => block.trim());
  const title = blocks.shift()?.replace(/^# /, "");
  const intro = [], sections = [], faqs = [];
  let section, question, inFaq = false;
  for (const block of blocks) {
    if (block.startsWith("## ")) {
      const heading = block.slice(3);
      if (/frequently|questions fréquentes|häufige fragen|자주 묻는|よくある/i.test(heading)) { inFaq = true; section = null; continue; }
      inFaq = false; section = { title: heading, paragraphs: [] }; sections.push(section); continue;
    }
    if (inFaq) {
      if (block.startsWith("### ")) { question = [block.slice(4), ""]; faqs.push(question); }
      else { if (!question) throw new Error("FAQ question missing"); question[1] += (question[1] ? " " : "") + block.replace(/\s*\n\s*/g, " "); }
      continue;
    }
    if (block.startsWith("|")) {
      if (!section) throw new Error("Table section missing");
      const rows = block.split(/\r?\n/).map(line => line.split("|").slice(1,-1).map(cell => cell.trim()));
      section.table = { headers: rows[0], rows: rows.slice(2) }; section.after = []; continue;
    }
    const paragraph = block.replace(/\s*\n\s*/g, " ");
    if (!section) intro.push(paragraph);
    else (section.after ?? section.paragraphs).push(paragraph);
  }
  const closing = sections.pop();
  if (!title || !intro.length || !closing || faqs.length < 3) throw new Error(`Incomplete article: ${title}`);
  const article = { title, intro, sections, faqs, close: { ...closing, cta: meta.cta_label ?? "" } };
  return { meta, article };
}

// Deterministic integration only. Prose is supplied in the locale Markdown sources.
// Hashes link every locale to the exact English revision used for this batch.
export async function prepareSeries() {
  const outputs = {}, metadata = {}, state = {};
  const statePath = path.join(root,"scripts/localization/state/procurement-series.json");
  let previous = {};
  try { previous = JSON.parse(await readFile(statePath,"utf8")); } catch (error) { if (error.code !== "ENOENT") throw error; }
  for (const locale of locales) {
    const dir = path.join(root,"content/procurement-series",locale);
    const files = (await readdir(dir)).filter(file => file.endsWith(".md")).sort();
    if (files.length !== keys.length) throw new Error(`${locale}: expected five source articles`);
    outputs[locale] = { locale, articles: {} }; metadata[locale] = {};
    for (let i=0;i<keys.length;i++) {
      const parsed = parseArticle(await readFile(path.join(dir,files[i]),"utf8"));
      if (!parsed.meta.seo_title || !parsed.meta.meta_description) throw new Error(`${locale}/${files[i]}: metadata missing`);
      outputs[locale].articles[keys[i]] = parsed.article;
      metadata[locale][keys[i]] = { title: parsed.meta.seo_title, description: parsed.meta.meta_description, keyword: parsed.meta.primary_keyword ?? "", cta: parsed.meta.cta_label ?? "" };
    }
  }
  for (const locale of locales.slice(1)) {
    state[locale] = Object.fromEntries(keys.map(key => {
      const sourceHash = stableHash(outputs.en.articles[key]);
      const targetHash = stableHash(outputs[locale].articles[key]);
      return [key, nextTranslationState(previous[locale]?.[key], sourceHash, targetHash)];
    }));
  }
  const out = path.join(root,"src/content/procurement-series");
  await mkdir(out,{recursive:true});
  for (const locale of locales) await writeFile(path.join(out,`${locale}.json`),JSON.stringify(outputs[locale],null,2)+"\n","utf8");
  await writeFile(path.join(root,"src/content/procurement-series-meta.js"),`// Generated from content/procurement-series; use the existing localization prepare command.\nexport const procurementSeriesMeta = ${JSON.stringify(metadata,null,2)};\n`,"utf8");
  await writeFile(statePath,JSON.stringify(state,null,2)+"\n","utf8");
  // Preserve existing image entries and add only newly registered article URLs.
  const { siteRoutes } = await import("../../src/siteRoutes.js");
  const sitemapPath = path.join(root,"public/sitemap.xml");
  let sitemap = await readFile(sitemapPath,"utf8");
  const missing = Object.values(siteRoutes).filter(route => !sitemap.includes(`<loc>https://zhonigolf.com${route.path}</loc>`));
  if (missing.length) {
    sitemap = sitemap.replace("</urlset>",missing.map(route => `  <url><loc>https://zhonigolf.com${route.path}</loc></url>`).join("\n")+"\n</urlset>");
    await writeFile(sitemapPath,sitemap,"utf8");
  }
  console.log("Prepared 25 articles from locale Markdown sources; no translation API or deployment used.");
}
export function nextTranslationState(previous, sourceHash, targetHash) {
  // Re-running preparation cannot silently accept an unchanged, stale translation.
  return { sourceHash: previous?.targetHash === targetHash ? previous.sourceHash : sourceHash, targetHash };
}
if (path.resolve(process.argv[1] ?? "") === fileURLToPath(import.meta.url)) await prepareSeries();
