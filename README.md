# ZHONI Golf — Cloudflare Pages deployment

This is the clean deployment repository for zhonigolf.com. It contains the Vite website, Cloudflare Pages Function for `/api/inquiry`, public media assets and the project checks. It intentionally excludes local dependencies, build output, planning material, backups and all credentials.

## Deploy from GitHub to Cloudflare Pages

- Framework preset: `None`
- Build command: `npm run build`
- Build output directory: `dist/client`
- Root directory: `/`
- Node.js version: `20` or later

The `functions/api/inquiry.js` file is a Cloudflare Pages Function. Deploy from Git integration rather than a static drag-and-drop upload so the inquiry API is included.

## Cloudflare Pages Variables and Secrets

Add these after the first Pages deployment. Use `Production`; mirror them in `Preview` when testing.

### Secrets

- `RESEND_API_KEY`
- `TURNSTILE_SECRET_KEY`

### Variables

- `INQUIRY_TO_EMAIL=sales@zhonigolf.com`
- `INQUIRY_FROM_EMAIL=ZHONI Website <sales@zhonigolf.com>`
- `INQUIRY_BACKUP_EMAIL=zhonigolf@gmail.com`
- `VITE_SITE_URL=https://zhonigolf.com`
- `VITE_WHATSAPP_URL=https://wa.me/8617759190848`
- `VITE_GA4_MEASUREMENT_ID=G-MDM5K38CXF`
- `VITE_TURNSTILE_SITE_KEY=<Turnstile site key>`

`VITE_*` values are public build-time values. Never put an API key or private token in a `VITE_*` variable.

## Anti-spam rate limiting (recommended)

Create a Cloudflare KV namespace and add it under **Settings → Bindings** with the binding name `INQUIRY_RATE_LIMIT`. This is a KV binding, not a text environment variable. The form remains protected by Turnstile and a honeypot when this optional binding is not present.

## Before production

1. Verify the Resend domain and sender.
2. Create a Turnstile widget for `zhonigolf.com` and add both keys above.
3. Deploy, then submit a real test inquiry.
4. Confirm receipt at `sales@zhonigolf.com`, the Gmail backup, and Reply-To behaviour.
5. Bind `zhonigolf.com` in Cloudflare Pages.
6. In GA4, mark `generate_lead` as a key event after confirming it in DebugView.

Run checks locally with:

```bash
npm ci
npm run build
npm run test:sites
```