import assert from "node:assert/strict";
import test from "node:test";
import { onRequestPost } from "../functions/api/inquiry.js";

function configuredEnv(overrides = {}) {
  return {
    RESEND_API_KEY: "re_test_key",
    INQUIRY_TO_EMAIL: "sales@zhonigolf.com",
    INQUIRY_FROM_EMAIL: "ZHONI Website <sales@zhonigolf.com>",
    ...overrides,
  };
}

function inquiryRequest(fields = {}) {
  const form = new FormData();
  form.set("name", "Test Buyer");
  form.set("email", "buyer@example.com");
  form.set("project_type", "Individual custom golf product");
  form.set("quantity_range", "200 pieces");
  form.set("message", "Please share available customisation options.");
  for (const [name, value] of Object.entries(fields)) form.set(name, value);
  return new Request("https://zhonigolf.com/api/inquiry", { method: "POST", body: form });
}

test("provides a usable direct-contact fallback when Turnstile is not configured", async () => {
  const response = await onRequestPost({ request: inquiryRequest(), env: configuredEnv() });

  assert.equal(response.status, 503);
  assert.deepEqual(await response.json(), {
    ok: false,
    error: "Online inquiry is temporarily unavailable. Please email sales@zhonigolf.com or use WhatsApp.",
  });
});

test("accepts a blank or free-text product category while retaining contact and message validation", async () => {
  const originalFetch = globalThis.fetch;
  const deliveries = [];
  globalThis.fetch = async (url, options) => {
    if (String(url).includes("/siteverify")) return Response.json({ success: true });
    deliveries.push(JSON.parse(options.body));
    return Response.json({ id: "test-delivery" });
  };
  try {
    const env = configuredEnv({ TURNSTILE_SECRET_KEY: "test-secret" });
    for (const projectType of ["", "Custom towel and cap combination"]) {
      const response = await onRequestPost({ request: inquiryRequest({ project_type: projectType, "cf-turnstile-response": "test-token" }), env });
      assert.equal(response.status, 200);
      assert.equal((await response.json()).ok, true);
    }
    assert.match(deliveries[0].subject, /General inquiry/);
    assert.match(deliveries[1].text, /Custom towel and cap combination/);
    const invalid = await onRequestPost({ request: inquiryRequest({ project_type: "", message: "", "cf-turnstile-response": "test-token" }), env });
    assert.equal(invalid.status, 400);
    assert.equal(deliveries.length, 2);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
