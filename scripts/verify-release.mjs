import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { auditRelease } from "./release-audit.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const reportDir = path.join(root, "tools/reports");
const quick = process.argv.includes("--quick");
const unknown = process.argv.slice(2).filter(arg => arg !== "--quick");
if (unknown.length) throw new Error(`Unknown arguments: ${unknown.join(" ")}`);
mkdirSync(reportDir, { recursive: true });
const stampFile = path.join(reportDir, "verified-build.json");
const steps = [];
const started = new Date().toISOString();
let audit;

function fingerprint() {
  const hash = createHash("sha256");
  hash.update(process.version);
  function visit(relative) {
    const full = path.join(root, relative);
    if (!existsSync(full)) return;
    hash.update(relative);
    const entries = readdirSync(full, { withFileTypes: true }).sort((a,b)=>a.name.localeCompare(b.name));
    for (const entry of entries) {
      const child = path.join(relative, entry.name);
      if (entry.isDirectory()) visit(child);
      else if (entry.isFile()) { hash.update(child); hash.update(readFileSync(path.join(root,child))); }
    }
  }
  for (const dir of ["src", "public", "scripts", "tests", "functions", "worker", ".openai"]) visit(dir);
  for (const file of ["package.json", "package-lock.json", "vite.config.mjs", "index.html", ".env", ".env.local", ".env.production", ".env.production.local"]) {
    if (existsSync(path.join(root,file))) { hash.update(file); hash.update(readFileSync(path.join(root,file))); }
  }
  // Hashes only: no environment or secret values are written to the report.
  for (const key of Object.keys(process.env).filter(key=>key.startsWith("VITE_")).sort()) { hash.update(key); hash.update(process.env[key]); }
  return hash.digest("hex");
}

function run(name, args) {
  const stepStarted = Date.now();
  const result = spawnSync(process.execPath, args, { cwd: root, encoding: "utf8", windowsHide: true, maxBuffer: 16 * 1024 * 1024 });
  const ok = !result.error && result.status === 0;
  const durationMs = Date.now() - stepStarted;
  const testCount = result.stdout?.match(/(?:ℹ|#) tests (\d+)/)?.[1];
  steps.push({ name, status: ok ? "PASS" : "FAIL", durationMs, ...(testCount ? { tests: Number(testCount) } : {}) });
  console.log(`${ok ? "PASS" : "FAIL"} ${name}${testCount ? ` (${testCount} tests)` : ""} · ${(durationMs / 1000).toFixed(1)}s`);
  if (!ok) {
    writeFileSync(path.join(reportDir,"last-failure.log"), `${result.error?.message ?? ""}\n${result.stdout ?? ""}\n${result.stderr ?? ""}`);
    throw new Error(`${name} failed; see tools/reports/last-failure.log`);
  }
}

try {
  const before = fingerprint();
  if (quick) {
    const stamp = existsSync(stampFile) ? JSON.parse(readFileSync(stampFile,"utf8")) : null;
    if (stamp?.fingerprint !== before) throw new Error("Quick check refused: source or build inputs changed. Run npm run verify first.");
    console.log("PASS unchanged build inputs; reusing the previously verified build");
  } else {
    const npmCli = process.env.npm_execpath;
    if (!npmCli) throw new Error("Run this script through npm run verify.");
    run("Production build (once)", [npmCli, "run", "build"]);
  }
  const tests = readdirSync(path.join(root,"tests")).filter(file=>file.endsWith(".test.mjs")).sort().map(file=>`tests/${file}`);
  run("All regression tests", ["--test", ...tests]);
  run("Existing plush localization-engine check", ["scripts/localization/check.mjs"]);
  audit = auditRelease(root);
  console.log(`${audit.status} static release audit: ${JSON.stringify(audit.stats)}`);
  if (audit.failures.length) throw new Error(`${audit.failures.length} static audit failure(s)`);
  if (fingerprint() !== before) throw new Error("Inputs changed during verification. Re-run npm run verify.");
  writeFileSync(stampFile, JSON.stringify({ fingerprint: before, verifiedAt: new Date().toISOString() }, null, 2));
} catch (error) {
  steps.push({ name: error.message, status: "FAIL" });
  console.error(error.message);
  process.exitCode = 1;
} finally {
  const status = process.exitCode ? "FAIL" : "PASS";
  const report = { status, mode: quick ? "quick" : "full", started, finished: new Date().toISOString(), steps, audit,
    notVerified: ["Visual quality and real-device behavior", "Live deployment and CDN state", "Real inquiry email delivery", "GA4 receipt of events and AI/search performance"] };
  writeFileSync(path.join(reportDir,"release-check.json"),JSON.stringify(report,null,2));
  writeFileSync(path.join(reportDir,"release-check.md"),`# Release check: ${status}\n\nMode: ${report.mode}\n\n${steps.map(step=>`- ${step.status}: ${step.name}`).join("\n")}\n\n## Static audit\n\n${JSON.stringify(audit?.stats ?? {})}\n\n${audit?.failures.map(message=>`- ${message}`).join("\n") ?? ""}\n\n## Still requires human or live verification\n\n${report.notVerified.map(message=>`- ${message}`).join("\n")}\n`);
  console.log(`${status}: tools/reports/release-check.md (local only; not published)`);
}
