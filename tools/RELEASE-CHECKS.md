# Local release verification

These tools run locally. Scripts, tests and reports are not public website pages.
Cloudflare's build command remains `npm run build` and the output remains `dist/client`.

## Normal workflow

From the repository directory, run:

```powershell
npm run verify
```

This builds once, runs every `tests/*.test.mjs` file, checks the existing four-language
plush localization cluster, then audits all prerendered routes, local links/assets,
canonical/language/schema, core product–guide return paths and inquiry plan links.
The new focus modules are covered by regression tests, not by the plush-only adapter check.
Any failing stage exits nonzero. A successful build alone is not a release PASS.

Local, ignored reports:

- `tools/reports/release-check.md`: compact summary and remaining manual checks.
- `tools/reports/release-check.json`: machine-readable result.
- `tools/reports/last-failure.log`: last failed subprocess output; may be from an earlier run.
- `tools/reports/verified-build.json`: successful input fingerprint, not a deployment record.

## Repeat without rebuilding unchanged inputs

```powershell
npm run verify:quick
```

Quick mode only reuses a previously verified build if the source, tests, scripts,
public files, build configuration and relevant environment fingerprint match.
It still runs the tests and static audit. Changed inputs cause refusal: use the full command.
No environment values or secrets are included in reports. Reports are ignored by Git.

## Measurement contract

`product_family_click` keeps its existing name, with `product_family` set to
`towels`, `caps`, `plush` or `other`; `product_group` distinguishes `core` and
`supporting`; `placement` distinguishes homepage core, product-hub core and supporting cards.
`item_url`, language and page path retain the selected route context.
`product_research_click` distinguishes `product_to_guide` and `guide_to_product`.
Both use the existing analytics-consent gate. Configuration checks do not prove that GA4
has received events. Register event-scoped custom dimensions in GA4 if those fields
are needed in reports; no account configuration is changed by this script.

## Manual/live checks (not automatically passed)

- After changing layout, fonts, header or images: inspect the affected desktop/mobile views.
  Do not repeat every screenshot after content-only changes that passed the checks.
- After deployment: confirm the intended commit is live and check a core-product inquiry path.
- Actual email delivery requires an approved real submission; the script sends no inquiry.
- GA4 event arrival needs account-side observation; the script sends no synthetic analytics.
- Search indexing, enquiries and AI citations need actual data; a script PASS does not predict them.

The tools do not commit, push, deploy, create a monitoring job or modify long-term memory.
