import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { siteRoutes } from "../src/siteRoutes.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const siteOrigin = "https://zhonigolf.com";

function escapeHtml(value) {
  return value.replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

export function renderRouteDocument(template, route, appMarkup = "", structuredData = null) {
  const canonical = `${siteOrigin}${route.path}`;
  const englishPath = route.lang ? route.alternatePath : route.path;
  const localizedRoutes = Object.values(siteRoutes).filter(candidate => candidate.lang && candidate.alternatePath === englishPath);
  const title = escapeHtml(route.title);
  const description = escapeHtml(route.description);
  const cleanTemplate = template
    .replace(/\s*<meta name="description"[^>]*>/i, "")
    .replace(/\s*<link rel="canonical"[^>]*>/i, "")
    .replace(/\s*<meta property="og:title"[^>]*>/i, "")
    .replace(/\s*<meta property="og:description"[^>]*>/i, "")
    .replace(/\s*<meta property="og:type"[^>]*>/i, "")
    .replace(/\s*<meta property="og:url"[^>]*>/i, "")
    .replace(/\s*<link rel="alternate"[^>]*>/gi, "")
    .replace(/\s*<script id="zhoni-page-schema"[^>]*>[\s\S]*?<\/script>/i, "")
    .replace(/<html lang="[^"]*">/i, `<html lang="${route.lang ?? "en"}">`)
    .replace(/<title>[\s\S]*?<\/title>/i, `<title>${title}</title>`);
  const metadata = [
    `<meta name="description" content="${description}" />`,
    `<link rel="canonical" href="${canonical}" />`,
    `<meta property="og:title" content="${title}" />`,
    `<meta property="og:description" content="${description}" />`,
    '<meta property="og:type" content="website" />',
    `<meta property="og:url" content="${canonical}" />`,
    `<link rel="alternate" hreflang="en" href="${siteOrigin}${englishPath}" />`,
    ...localizedRoutes.map(candidate => `<link rel="alternate" hreflang="${candidate.lang}" href="${siteOrigin}${candidate.path}" />`),
    `<link rel="alternate" hreflang="x-default" href="${siteOrigin}${englishPath}" />`,
    ...(structuredData ? [`<script id="zhoni-page-schema" type="application/ld+json">${JSON.stringify(structuredData).replace(/</g, "\\u003c")}</script>`] : []),
  ].join("\n    ");

  return cleanTemplate
    .replace("</head>", `    ${metadata}\n  </head>`)
    .replace('<div id="root"></div>', `<div id="root">${appMarkup}</div>`);
}

async function prerenderRoutes() {
  const outputDirectory = path.join(root, "dist", "client");
  const template = await readFile(path.join(outputDirectory, "index.html"), "utf8");
  const serverEntry = path.join(root, "dist", "ssr", "entry-server.js");
  const { renderPage } = await import(pathToFileURL(serverEntry).href);

  for (const route of Object.values(siteRoutes)) {
    const { markup, structuredData } = renderPage(route.path);
    const document = renderRouteDocument(template, route, markup, structuredData);
    const routeDirectory = route.path === "/"
      ? outputDirectory
      : path.join(outputDirectory, route.path.replace(/^\//, ""));
    await mkdir(routeDirectory, { recursive: true });
    await writeFile(path.join(routeDirectory, "index.html"), document);
  }

  console.log(`Prerendered full HTML content and SEO metadata for ${Object.keys(siteRoutes).length} routes.`);
}

if (path.resolve(process.argv[1] ?? "") === fileURLToPath(import.meta.url)) {
  await prerenderRoutes();
}
