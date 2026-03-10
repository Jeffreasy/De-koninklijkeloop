# Vercel Deployment — Frontend

## Overzicht

Het DKL frontend draait op **Vercel** met Astro SSR (server-side rendering).

---

## Astro Vercel Adapter

`astro.config.mjs` gebruikt de Vercel adapter:

```javascript
import vercel from '@astrojs/vercel/serverless';

export default defineConfig({
  output: 'server',
  adapter: vercel(),
});
```

---

## vercel.json — Security Headers

Het `vercel.json` bestand configureert:
- **Security headers** op alle responses
- **Route rewrites** voor API proxy
- **Cache-Control** voor statische assets

### Headers configuratie

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "Content-Security-Policy", "value": "..." }
      ]
    }
  ]
}
```

---

## Environment Variables in Vercel

```bash
# Toevoegen via CLI
vercel env add PUBLIC_CONVEX_URL production

# Of via Vercel Dashboard → Project → Settings → Environment Variables
```

---

## Preview Deployments

Elke Pull Request krijgt een automatische preview-URL van Vercel.

---

## Cache Busting (Nuclear Level 3)

Bij deployment worden stale caches geïnvalideerd via:
1. `Clear-Site-Data: "cache"` response header
2. `Vary: Accept-Encoding, User-Agent` voor mobiele proxies
3. Actieve Service Worker registratie die legacy workers force-unregistert

---

*← [overview.md](./overview.md) · Volgende: [docker.md](./docker.md)*
