# Environment Variables — Overzicht

> **Nooit** gevoelige variabelen committen naar Git. `.env` bevat alleen publieke waarden; geheimen staan in `.env.local`.

---

## `.env` (Gecommit — Publiek)

| Variabele | Voorbeeld | Beschrijving |
|---|---|---|
| `PUBLIC_CONVEX_URL` | `https://frugal-goose-15.convex.cloud` | Convex project URL |
| `PUBLIC_API_URL` | `https://laventecareauthsystems.onrender.com/api/v1` | LaventeCare Go backend URL |
| `PUBLIC_TENANT_ID` | `b2727666-...` | DKL tenant ID voor LaventeCare |
| `PUBLIC_DEV_TENANT_ID` | `b2727666-...` | Tenant ID voor dev omgeving |
| `CONVEX_DEPLOYMENT` | `dev:frugal-goose-15` | Convex deployment identifier |
| `PUBLIC_IMAGEKIT_URL_ENDPOINT` | `https://ik.imagekit.io/a0oim4e3e` | ImageKit CDN base URL |
| `IMAGEKIT_PUBLIC_KEY` | `public_...` | ImageKit public key |

---

## `.env.local` (Niet gecommit — Privé)

| Variabele | Beschrijving |
|---|---|
| `IMAGEKIT_PRIVATE_KEY` | ImageKit private key (server-side signed uploads) |
| `TENANT_SECRET_KEY` | Gedeeld geheim voor server-to-server auth calls |

---

## Runtime Variabelen (Gelezen in middleware/code)

| Variabele | Gebruikt in | Beschrijving |
|---|---|---|
| `PUBLIC_API_URL` | `src/middleware.ts` | Backend URL voor `/auth/me` validatie |
| `PUBLIC_TENANT_ID` | `src/middleware.ts` | `X-Tenant-ID` header |
| `API_TARGET` | `astro.config.mjs` (Vite proxy) | Backend target voor dev proxy |

> ⚠️ **Let op:** De variabele heet `PUBLIC_API_URL` (niet `PUBLIC_LAVENTECARE_API_URL`). Gebruik altijd de exacte naam uit `.env`.

---

## Lokale Development Waarden

Voor lokale dev gebruik je:
- `PUBLIC_API_URL=http://localhost:8080/api/v1` (of via Vite proxy: `/api/v1`)
- `PUBLIC_CONVEX_URL=https://[jouw-dev-deployment].convex.cloud`

### Vite Dev Proxy

`astro.config.mjs` configureert een proxy voor lokale dev:
```javascript
proxy: {
  '/api/v1': { target: process.env.API_TARGET || 'http://localhost:8080' },
  '/api/email': { target: process.env.API_TARGET || 'http://localhost:8080' }
}
```
Hierdoor hoef je in dev geen CORS te configureren.

---

## Productie (Vercel)

Stel productie-variabelen in via Vercel Dashboard → Project → Settings → Environment Variables, of via CLI:
```bash
vercel env add PUBLIC_API_URL production
```

---

*← [local-development.md](./local-development.md) · [Terug naar docs/README.md](../README.md)*
