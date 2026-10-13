import { analyzeLocalization, formatReport } from "./engine.mjs";

const locales = ["ko", "fr-CA", "ja", "de"];
let failed = false;
for (const locale of locales) {
  try {
    const report = await analyzeLocalization({ locale, cluster: "plush-headcovers" });
    console.log(formatReport(report));
    if (report.status === "failed" || (report.status === "ready" && report.stale)) failed = true;
  } catch (error) {
    console.error(`FAIL ${locale}: ${error.message}`);
    failed = true;
  }
}
if (failed) process.exitCode = 1;
