import { analyzeLocalization, formatReport } from "./engine.mjs";

const args = process.argv.slice(2);
const valueFor = flag => {
  const index = args.indexOf(flag);
  return index >= 0 ? args[index + 1] : undefined;
};
const locale = valueFor("--locale");
const cluster = valueFor("--cluster") ?? "plush-headcovers";

if (!locale) {
  console.error("Usage: npm run i18n:sync -- --locale ko --cluster plush-headcovers");
  process.exit(2);
}

try {
  const report = await analyzeLocalization({ locale, cluster });
  console.log(formatReport(report));
  if (report.status === "failed" || (report.status === "ready" && report.stale)) process.exitCode = 1;
} catch (error) {
  console.error(`FAIL ${locale}: ${error.message}`);
  process.exitCode = 1;
}
