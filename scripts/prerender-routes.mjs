import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { siteRoutes } from "../src/siteRoutes.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const siteOrigin = "https://zhonigolf.com";

function escapeHtml(value) {
  return value.replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

export function renderRouteDocument(template, route) {
  const canonical = `${siteOrigin}${route.path}`;
  const title = escapeHtml(route.title);
  const description = escapeHtml(route.description);
  const cleanTemplate = template
    .replace(/\s*<meta name="description"[^>]*>/i, "")
    .replace(/\s*<link rel="canonical"[^>]*>/i, "")
    .replace(/\s*<meta property="og:title"[^>]*>/i, "")
    .replace(/\s*<meta property="og:description"[^>]*>/i, "")
    .replace(/\s*<meta property="og:type"[^>]*>/i, "")
    .replace(/\s*<meta property="og:url"[^>]*>/i, "")
    .replace(/<title>[\s\S]*?<\/title>/i, `<title>${title}</title>`);
  const metadata = [
    `<meta name="description" content="${description}" />`,
    `<link rel="canonical" href="${canonical}" />`,
    `<meta property="og:title" content="${title}" />`,
    `<meta property="og:description" content="${description}" />`,
    '<meta property="og:type" content="website" />',
    `<meta property="og:url" content="${canonical}" />`,
  ].join("\n    ");

  return cleanTemplate.replace("</head>", `    ${metadata}\n  </head>`);
}

async function prerenderRoutes() {
  const outputDirectory = path.join(root, "dist", "client");
  const template = await readFile(path.join(outputDirectory, "index.html"), "utf8");

  for (const route of Object.values(siteRoutes)) {
    const document = renderRouteDocument(template, route);
    const routeDirectory = route.path === "/"
      ? outputDirectory
      : path.join(outputDirectory, route.path.replace(/^\//, ""));
    await mkdir(routeDirectory, { recursive: true });
    await writeFile(path.join(routeDirectory, "index.html"), document);
  }

  console.log(`Prerendered SEO metadata for ${Object.keys(siteRoutes).length} routes.`);
}

if (path.resolve(process.argv[1] ?? "") === fileURLToPath(import.meta.url)) {
  await prerenderRoutes();
}
