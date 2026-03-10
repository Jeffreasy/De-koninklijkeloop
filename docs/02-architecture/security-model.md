# Security Model — Zero-Trust Architecture

> "Silence is Golden, the Database is a Fortress." — LaventeCare Anti-Gravity Protocol

---

## Security Filosofie

Het DKL platform volgt een **Zero-Trust** benadering:
- Elke request wordt gevalideerd — geen impliciete vertrouwensrelaties
- Minimale rechten per rol (Least Privilege)
- Defense in depth — meerdere lagen bescherming
- "Input is Toxic" — alle input wordt gesaniteerd voor verwerking

---

## Authenticatie

### JWT + HttpOnly Cookies

De auth flow gebruikt twee token types:

| Token | Type | Levensduur | Opslag |
|---|---|---|---|
| **Access Token** | RS256 JWT | 15 minuten | HttpOnly Cookie |
| **Refresh Token** | Opaque string | 7 dagen | HttpOnly Cookie |

```
Browser → POST /auth/login →
  ← Set-Cookie: access_token=...; HttpOnly; Secure; SameSite=Strict
  ← Set-Cookie: refresh_token=...; HttpOnly; Secure; SameSite=Strict
```

**Voordelen HttpOnly cookies:**
- JavaScript (inclusief XSS) kan de tokens **niet** lezen
- Automatisch meegestuurd door de browser
- Geen localStorage of sessionStorage risks

### Token Validatie

Elke beveiligde API call:
```
Request → Middleware → Go /auth/me →
  ├─ JWT signature verificatie (RS256 public key)
  ├─ Token expiry check
  ├─ Tenant validatie
  └─ Rol ophalen → Astro.locals.user
```

---

## RBAC — Role-Based Access Control

Het platform heeft 4 rollen in hiërarchische volgorde:

```
viewer < user < editor < admin
```

| Rol | DKL Equivalent | Rechten |
|---|---|---|
| `viewer` | Deelnemer / Gast | Eigen data inzien |
| `user` | Deelnemer met account | Dashboard, profiel bewerken |
| `editor` | Editor | Alle admin modules (beperkt) |
| `admin` | Administrator | Alles inclusief instellingen, blog, X Poster |

### Route Beveiliging

Middleware in `src/middleware.ts` bewaakt alle routes:

```typescript
// Beschermde routing patronen
'/admin/**'    → editor of hoger vereist
'/dashboard'   → user of hoger vereist  
'/profiel'     → user of hoger vereist
'/admin/settings' → admin only
'/admin/blog'     → admin only
'/admin/x-poster' → admin only
```

---

## HTTP Security Headers

De volgende headers worden via de **Astro middleware** (`src/middleware.ts`) op **alle** server-side responses gestuurd:

| Header | Waarde | Doel |
|---|---|---|
| `Content-Security-Policy` | Strikte whitelist | Voorkomt XSS, ongewenste script-bronnen |
| `X-Frame-Options` | `SAMEORIGIN` (dev) / `DENY` (prod) | Voorkomt clickjacking via iframes |
| `X-Content-Type-Options` | `nosniff` | Voorkomt MIME-type sniffing |

### Content Security Policy Whitelist

Toegestane bronnen in de CSP (exact uit `src/middleware.ts`):

| Domein | Toegestaan voor | Doel |
|---|---|---|
| `*.convex.cloud`, `wss://*.convex.cloud` | `connect-src`, `script-src` | Convex WebSocket + API |
| `ik.imagekit.io`, `upload.imagekit.io` | `img-src`, `connect-src` | Media CDN |
| `*.streamable.com` | `frame-src`, `img-src` | Video embeds |
| `*.tile.openstreetmap.org`, `*.basemaps.cartocdn.com` | `img-src`, `connect-src` | Kaart-tiles (Leaflet) |
| `www.komoot.com`, `*.komoot.de` | `frame-src` | Route embeds |
| `www.gofundme.com` | `script-src`, `frame-src` | Donatie widget |
| `api.fontshare.com`, `fonts.googleapis.com` | `style-src`, `font-src` | Web fonts |
| `cdn.jsdelivr.net`, `code.iconify.design` | `script-src` | Iconify iconen |
| `va.vercel-scripts.com`, `va.vercel-analytics.com` | `script-src`, `connect-src` | Vercel Analytics |
| `vercel.live` | `script-src`, `frame-src`, `frame-ancestors` | Vercel preview toolbar |
| `laventecareauthsystems.onrender.com`, `auth.laventecare.nl` | `connect-src` | LaventeCare backend |
| `localhost:8080`, `ws://localhost:8080` | `connect-src` | Lokale development |

---

## Database Security (PostgreSQL)

### Row Level Security (RLS)

Elke query via de Go backend loopt automatisch door RLS policies:
- Tenant A kan de data van Tenant B **nooit** lezen of schrijven
- Geïmplementeerd op database-niveau — niet alleen applicatielagenbevel

### Encrypted Secrets

SMTP en IMAP credentials worden opgeslagen als **AES-256-GCM encrypted blobs**:
- Encryptiesleutel staat in env var `AES_KEY` (nooit in de database)
- Elke encrypted blob heeft een unieke nonce

---

## MFA (Multi-Factor Authenticatie)

- **TOTP** (Google Authenticator-compatibel) — optioneel per gebruiker
- **Email OTP** — voor wachtwoord reset en email-wijziging flows
- MFA kan per tenant verplicht worden gesteld door de admin

---

## GDPR Compliance

- **Cookieloos analytics** — IP-adressen worden SHA-256 gehasht, geen tracking cookies
- **Data export** — gebruikers kunnen hun data downloaden (`/admin/gdpr` of via Convex module)
- **Account verwijdering** — volledige datapurge via `gdpr.ts` Convex module
- **Email audit trail** — `email_logs` bewaart recipient hash i.p.v. plain email

---

*← [data-layer.md](./data-layer.md) · Volgende: [performance.md](./performance.md)*
