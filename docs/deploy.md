# Deploy

## Target

Primary target: **Vercel**.

The repo already includes [vercel.json](../vercel.json) with a rewrite to `index.html`, and the Vite build emits both entry points:

- `/index.html` (app)
- `/marketing.html` (landing page)

## Steps

1. Import the repository into Vercel.
2. Build command: `npm run build`
3. Output directory: `dist`
4. Node version: `20.x`
5. Deploy from `main` for production.

## Route behavior

- `/` serves the scheduling app.
- `/marketing.html` serves the marketing page.
- Unknown routes rewrite to `/index.html` per `vercel.json`.

## Post-deploy checks

1. Open `/` and verify app boot + persisted local state behavior.
2. Open `/marketing.html` and verify hero, sections, and CTA links.
3. Verify social metadata resolves:
   - `/og.png`
   - `og:*` tags
   - `twitter:*` tags
4. Run `npm run test:e2e` against the deployed URL in a follow-up smoke pass if needed.
