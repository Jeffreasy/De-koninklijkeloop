# De Koninklijke Loop — Developer README

<div align="center">

![De Koninklijke Loop](https://ik.imagekit.io/a0oim4e3e/tr:w-120,f-auto,q-80/De%20Koninklijkeloop/webassets/DKLLogoV1_kx60i9.webp)

**Inclusief wandelevenement platform · Apeldoorn · 16 mei 2026**

[![Deployed on Vercel](https://img.shields.io/badge/Deployed-Vercel-black?logo=vercel)](https://dekoninklijkeloop.nl)
[![Astro](https://img.shields.io/badge/Astro-5.x-orange?logo=astro)](https://astro.build)
[![Convex](https://img.shields.io/badge/Database-Convex-purple?logo=convex)](https://convex.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)](https://typescriptlang.org)

</div>

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend Framework** | [Astro 5](https://astro.build) (SSR, `output: server`) |
| **UI Components** | React 19 (Islands Architecture) |
| **Styling** | Tailwind CSS v4 + custom design tokens |
| **Database / Realtime** | [Convex](https://convex.dev) (serverless, reactive) |
| **Auth Backend** | LaventeCare AuthSystem (Go, JWT/HttpOnly cookies) |
| **CDN / Media** | ImageKit (images) + Streamable (video) |
| **Email** | IMAP/SMTP via LaventeCare Mail backend |
| **Analytics** | Custom Go backend + Vercel Speed Insights |
| **Deployment** | Vercel (Edge SSR, Web Analytics) |
| **State Management** | Nanostores (cross-island) |
| **Maps** | Leaflet + React-Leaflet + OpenStreetMap |
| **Rich Text** | TipTap |
| **Charts** | Recharts |

---

## Architectuur

```
┌─────────────────────────────────────────────────┐
│               dekoninklijkeloop.nl               │
│              Astro 5 SSR (Vercel)                │
├──────────────┬──────────────────────────────────┤
│  Public Pages│  Admin Dashboard (React Islands)  │
│  (Astro SSR) │  /admin/* + /dashboard            │
└──────────────┴──────────────────────────────────┘
       │                        │
       ▼                        ▼
┌─────────────┐       ┌─────────────────┐
│   Convex    │       │LaventeCare Auth  │
│  (Database) │       │  (Go Backend)   │
│  Realtime   │       │ JWT · RBAC · Mail│
└─────────────┘       └─────────────────┘
       │
       ▼
┌──────────────┐
│  ImageKit    │  Media CDN
│  Streamable  │  Video hosting
└──────────────┘
```

### Islands Architecture
Astro pagina's zijn statisch SSR. Interactieve componenten zijn React "islands" die hydrateren via:
- `client:only="react"` — voor admin-panelen (auth-afhankelijk)
- `client:load` — voor primaire dashboard-islands
- `client:idle` — voor niet-kritieke widgets (ThemeToggle)

### Dual Backend Pattern
| Data | Backend | Communicatie |
|---|---|---|
| Inschrijvingen, media, events, social, blog | **Convex** | `useQuery` / `useMutation` |
| Auth, e-mail, analytics | **Go (LaventeCare)** | BFF proxy via `/api/*` Astro endpoints |

---

## Projectstructuur

```
/
├── src/
│   ├── pages/
│   │   ├── index.astro          # Homepage
│   │   ├── register.astro       # Inschrijfformulier
│   │   ├── admin/               # Admin paneel (RBAC-beveiligd)
│   │   ├── api/                 # Server-side API endpoints (BFF)
│   │   │   ├── auth/            # Auth proxy naar LaventeCare
│   │   │   ├── email/           # Email proxy naar Go backend
│   │   │   └── send-confirmation.ts
│   │   ├── auth/                # Login/register flows
│   │   └── blog/                # Public blog
│   ├── components/
│   │   ├── admin/               # Admin React islands (60+ componenten)
│   │   ├── islands/             # Publieke React islands
│   │   ├── blocks/              # Astro blokcomponenten
│   │   └── ui/                  # Design system primitives (Button, Input, Card)
│   ├── layouts/
│   │   ├── BaseLayout.astro     # Public pages
│   │   └── AdminLayout.astro    # Admin dashboard shell
│   ├── lib/
│   │   ├── auth.ts              # Auth store + logout functie
│   │   ├── api.ts               # API client met 401-interceptor
│   │   └── apiAuth.ts           # Server-side auth helper voor API routes
│   ├── middleware.ts            # Zero-Trust auth + RBAC + CSP headers
│   └── styles/
│       └── global.css           # Design tokens + Tailwind v4 config
├── convex/
│   ├── schema.ts                # Database schema (20 tabellen)
│   ├── admin.ts                 # Admin mutations/queries
│   ├── register.ts              # Registratie flow
│   ├── authHelpers.ts           # Convex auth verificatie
│   └── ...                      # Per-module Convex functions
├── docs/
│   ├── APPLICATIE_OVERZICHT.md  # Niet-technisch platform overzicht
│   └── EDITOR_HANDLEIDING.md   # Onboarding voor Editor-rol
├── astro.config.mjs             # Astro + Vite + Vercel configuratie
└── convex.json                  # Convex project config
```

---

## Database Schema (Convex)

Het Convex schema bevat **20 tabellen**:

| Tabel | Beschrijving |
|---|---|
| `registrations` | Kern-CRM: alle inschrijvingen per editie |
| `users` | Admin/editor accounts (Convex-side) |
| `donations` | Donaties met betaalstatus |
| `donation_campaigns` | GoFundMe campagnes per jaar |
| `volunteer_tasks` | Taken toegewezen aan vrijwilligers |
| `media` | Foto's en video's met moderatiestatus |
| `media_metadata` | ImageKit alt-tekst en tags |
| `event_settings` | Singleton evenementconfiguratie |
| `social_posts` | Social media posts per editie |
| `social_reactions` | Emoji-reacties van bezoekers |
| `messages` | Contactformulier berichten |
| `presence` | Realtime aanwezigheid (groene stip) |
| `direct_messages` | 1-op-1 team chat |
| `group_conversations` | Groepsgesprekken |
| `group_messages` | Berichten in groepsgesprekken |
| `pr_organizations` | PR-database: zorgorganisaties |
| `pr_contacts` | PR-database: contactpersonen |
| `pr_send_history` | Log van PR-uitingen |
| `analytics_events` | Custom event tracking |
| `team_minutes` | Vergadernotulen |
| `event_schedule` | Evenementprogramma tijdlijn |
| `feedback` | Intern feedback-ticketsysteem |
| `blog_posts` | Blog artikelen |
| `blog_categories` | Blog categorieën |
| `blog_comments` | Blog reacties (met moderatie) |
| `blog_config` | Blog configuratie |
| `leads` | E-mail leads voor marketing |

---

## Authenticatie & Autorisatie

### Flow
1. Gebruiker logt in via `/login` → credentials naar LaventeCare Auth (Go)
2. Auth-backend retourneert JWT → opgeslagen als **HttpOnly cookie** (`access_token`)
3. Astro **middleware** (`src/middleware.ts`) valideert elke request via `GET /auth/me`
4. Gebruikersrol wordt opgeslagen in `Astro.locals.user`
5. RBAC blokkeert `/admin/*` voor niet-admin/editor rollen

### Rollen
```
admin   → Volledig toegang tot alle routes en modules
editor  → Admin-paneel, geen: /admin/settings, /admin/blog, /admin/x-poster
viewer  → Geen admin-toegang
deelnemer / begeleider / vrijwilliger → Alleen /dashboard
```

### Token Recovery (Client-side)
Admin React islands kunnen geen HttpOnly cookies lezen. `AdminLayout.astro` haalt het token op via `GET /api/auth/token` en voedt het in de Nanostores (`setAuth(token, user)`).

---

## Lokale Ontwikkeling

### Vereisten
- Node.js 20+
- Convex account + project
- LaventeCare Auth backend (lokaal of Render)

### Setup

```bash
# 1. Installeer dependencies
npm install

# 2. Maak .env.local aan (zie .env als voorbeeld)
cp .env .env.local

# 3. Start Convex dev server (in aparte terminal)
npx convex dev

# 4. Start Astro dev server
npm run dev
```

De app draait op `http://localhost:4321`.

### Vereiste Omgevingsvariabelen

| Variable | Beschrijving |
|---|---|
| `PUBLIC_CONVEX_URL` | Convex deployment URL |
| `PUBLIC_API_URL` | LaventeCare Auth backend URL |
| `PUBLIC_TENANT_ID` | LaventeCare tenant UUID |
| `IMAGEKIT_PRIVATE_KEY` | ImageKit server-side uploads |
| `PUBLIC_IMAGEKIT_PUBLIC_KEY` | ImageKit client-side |
| `PUBLIC_IMAGEKIT_URL_ENDPOINT` | ImageKit CDN base URL |

### Scripts

```bash
npm run dev        # Start dev server (localhost:4321)
npm run build      # Production build
npm run preview    # Preview production build lokaal
npx convex dev     # Convex realtime sync (apart terminal)
```

---

## Deployment

De applicatie wordt automatisch gedeployed naar **Vercel** via Git push naar `main`.

### Vite Proxy (Development)
Lokaal worden `/api/v1` en `/api/email` requests geproxied naar de Go backend:

```js
// astro.config.mjs
proxy: {
  '/api/v1': { target: 'http://localhost:8080' },
  '/api/email': { target: 'http://localhost:8080' }
}
```

---

## Beveiligingsmaatregelen

- **Zero-Trust:** Elke server-side route valideert het auth-token opnieuw
- **HttpOnly cookies:** Tokens niet toegankelijk via `document.cookie`
- **RBAC Middleware:** Paginaniveau-bescherming in `middleware.ts`
- **CSP Headers:** Strikte Content Security Policy op elke response
- **X-Frame-Options: DENY** — beschermt tegen clickjacking
- **Input sanitization:** `sanitize-html` voor HTML content in blog/editor

---

## Documentatie

| Document | Beschrijving |
|---|---|
| [APPLICATIE_OVERZICHT.md](./docs/APPLICATIE_OVERZICHT.md) | Niet-technisch platform overzicht voor team |
| [EDITOR_HANDLEIDING.md](./docs/EDITOR_HANDLEIDING.md) | Onboarding handleiding voor de Editor-rol |
| [CONVEX_SETUP.md](./CONVEX_SETUP.md) | Convex environment setup |

---

*De Koninklijke Loop · Maart 2026 · [dekoninklijkeloop.nl](https://dekoninklijkeloop.nl)*
