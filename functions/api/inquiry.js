const MAX_ATTACHMENT_BYTES = 3 * 1024 * 1024;
const MAX_REQUEST_BYTES = 4 * 1024 * 1024;
const ALLOWED_ATTACHMENT_TYPES = new Set(["application/pdf", "image/png", "image/jpeg", "application/postscript"]);

function json(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });
}

function textValue(form, name, maxLength = 500) {
  const value = form.get(name);
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function cleanSource(value) {
  return /^[a-z0-9-]{3,120}$/.test(value) ? value : "direct-quote";
}

function cleanLanguage(value) {
  return /^[a-z]{2,3}(-[a-z]{2})?$/i.test(value) ? value.toLowerCase() : "en";
}

function isBusinessEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 254;
}

function escapeHtml(value) {
  return value.replace(/[&<>'"]/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character]);
}

function bytesToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  const chunkSize = 0x8000;
  for (let index = 0; index < bytes.length; index += chunkSize) binary += String.fromCharCode(...bytes.subarray(index, index + chunkSize));
  return btoa(binary);
}

async function verifyTurnstile(token, request, env) {
  if (!env.TURNSTILE_SECRET_KEY || !token) return false;
  const form = new FormData();
  form.append("secret", env.TURNSTILE_SECRET_KEY);
  form.append("response", token);
  const remoteIp = request.headers.get("CF-Connecting-IP");
  if (remoteIp) form.append("remoteip", remoteIp);
  const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body: form });
  return response.ok && (await response.json()).success === true;
}

async function rateLimit(request, env) {
  if (!env.INQUIRY_RATE_LIMIT) return true;
  const ip = request.headers.get("CF-Connecting-IP") || "unknown";
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(ip));
  const key = `inquiry:${Array.from(new Uint8Array(digest)).map(value => value.toString(16).padStart(2, "0")).join("")}`;
  const count = Number(await env.INQUIRY_RATE_LIMIT.get(key) || 0);
  if (count >= 5) return false;
  await env.INQUIRY_RATE_LIMIT.put(key, String(count + 1), { expirationTtl: 600 });
  return true;
}

function buildEmailHtml(fields) {
  const rows = [["Name", fields.name], ["Business email", fields.email], ["Project type", fields.projectType], ["Quantity range", fields.quantityRange], ["Target in-hands date", fields.targetDate], ["Destination", fields.destination], ["Inquiry source", fields.source], ["Page language", fields.pageLanguage], ["Source page", fields.pagePath], ["Page URL", fields.pageUrl], ["Referrer", fields.referrer]].filter(([, value]) => value).map(([label, value]) => `<tr><th align="left" style="padding:7px 14px 7px 0;vertical-align:top">${escapeHtml(label)}</th><td style="padding:7px 0">${escapeHtml(value)}</td></tr>`).join("");
  return `<!doctype html><html><body style="font-family:Arial,sans-serif;color:#102b25"><h2>New ZHONI website project brief</h2><table>${rows}</table><h3>Project details</h3><p style="white-space:pre-wrap">${escapeHtml(fields.message)}</p></body></html>`;
}

export async function onRequestPost(context) {
  const { request, env } = context;
  const origin = request.headers.get("origin");
  const requestUrl = new URL(request.url);
  if (origin && origin !== requestUrl.origin) return json({ ok: false, error: "Request origin is not allowed." }, 403);
  if (Number(request.headers.get("content-length") || 0) > MAX_REQUEST_BYTES) return json({ ok: false, error: "Please keep attachments under 3 MB." }, 413);
  if (!env.RESEND_API_KEY || !env.INQUIRY_TO_EMAIL || !env.INQUIRY_FROM_EMAIL) return json({ ok: false, error: "Inquiry delivery is not configured yet." }, 503);

  let form;
  try { form = await request.formData(); } catch { return json({ ok: false, error: "We could not read this project brief." }, 400); }
  if (textValue(form, "company_website", 200)) return json({ ok: true });
  if (!await rateLimit(request, env)) return json({ ok: false, error: "Please wait a few minutes before sending another request." }, 429);
  if (!await verifyTurnstile(textValue(form, "cf-turnstile-response", 4096), request, env)) return json({ ok: false, error: "Please complete the spam-protection check and try again." }, 400);

  const fields = {
    name: textValue(form, "name", 120), email: textValue(form, "email", 254).toLowerCase(), projectType: textValue(form, "project_type", 140), quantityRange: textValue(form, "quantity_range", 80), targetDate: textValue(form, "target_date", 32), destination: textValue(form, "destination", 180), message: textValue(form, "message", 5000), source: cleanSource(textValue(form, "source", 120)), pageLanguage: cleanLanguage(textValue(form, "page_language", 16)), pagePath: textValue(form, "page_path", 500), pageUrl: textValue(form, "page_url", 2000), referrer: textValue(form, "referrer", 2000),
  };
  if (!fields.name || !isBusinessEmail(fields.email) || !fields.projectType || !fields.message) return json({ ok: false, error: "Please complete your name, business email, project type and project details." }, 400);

  const attachment = form.get("brand_assets");
  const attachments = [];
  if (attachment && typeof attachment === "object" && typeof attachment.arrayBuffer === "function" && attachment.size > 0) {
    const allowedExtension = /\.(pdf|png|jpe?g|ai)$/i.test(String(attachment.name || ""));
    if (attachment.size > MAX_ATTACHMENT_BYTES || (!ALLOWED_ATTACHMENT_TYPES.has(attachment.type) && !allowedExtension)) return json({ ok: false, error: "Please upload a PDF, PNG, JPG or AI file under 3 MB." }, 400);
    attachments.push({ filename: String(attachment.name || "brand-asset").replace(/[^a-zA-Z0-9._-]/g, "_"), content: bytesToBase64(await attachment.arrayBuffer()) });
  }

  const payload = {
    from: env.INQUIRY_FROM_EMAIL, to: [env.INQUIRY_TO_EMAIL], ...(env.INQUIRY_BACKUP_EMAIL ? { bcc: [env.INQUIRY_BACKUP_EMAIL] } : {}), reply_to: fields.email,
    subject: `New ZHONI project brief — ${fields.projectType}`, html: buildEmailHtml(fields),
    text: `New ZHONI website project brief\n\nName: ${fields.name}\nBusiness email: ${fields.email}\nProject type: ${fields.projectType}\nQuantity range: ${fields.quantityRange}\nTarget date: ${fields.targetDate}\nDestination: ${fields.destination}\nInquiry source: ${fields.source}\nPage language: ${fields.pageLanguage}\nSource page: ${fields.pagePath}\nPage URL: ${fields.pageUrl}\n\nProject details:\n${fields.message}`,
    ...(attachments.length ? { attachments } : {}),
  };

  try {
    const response = await fetch("https://api.resend.com/emails", { method: "POST", headers: { authorization: `Bearer ${env.RESEND_API_KEY}`, "content-type": "application/json" }, body: JSON.stringify(payload) });
    if (!response.ok) return json({ ok: false, error: "We could not send your project brief. Please use WhatsApp or try again shortly." }, 502);
  } catch { return json({ ok: false, error: "We could not send your project brief. Please use WhatsApp or try again shortly." }, 502); }
  return json({ ok: true });
}

export function onRequest() { return json({ ok: false, error: "Method not allowed." }, 405); }