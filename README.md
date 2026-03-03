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
| **CDN / Media** | ImageKit (foto's) + Streamable (video) |
| **Email** | IMAP/SMTP via LaventeCare Mail backend |
| **Analytics** | Custom Go backend + Vercel Speed Insights + Web Vitals |
| **Deployment** | Vercel (Edge SSR, Web Analytics, Speed Insights) |
| **State Management** | Nanostores (cross-island) |
| **Maps** | Leaflet + React-Leaflet + OpenStreetMap |
| **Rich Text** | TipTap v3 |
| **Charts** | Recharts |
| **Emoji Picker** | emoji-mart |
| **Animaties** | Framer Motion |
| **Forms** | React Hook Form + Zod |

---

## Architectuur

```
┌─────────────────────────────────────────────────┐
│               dekoninklijkeloop.nl               │
│              Astro 5 SSR (Vercel)                │
├──────────────┬──────────────────────────────────┤
│  Public Pages│  Admin Dashboard (React Islands)  │
│  (Astro SSR) │  /admin/*                        │
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
│  ImageKit    │  Media CDN (foto's)
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
| Inschrijvingen, media, events, social, blog, chat, PR | **Convex** | `useQuery` / `useMutation` |
| Auth, e-mail, analytics | **Go (LaventeCare)** | BFF proxy via `/api/*` Astro endpoints |

---

## Projectstructuur

```
/
├── src/
│   ├── pages/
│   │   ├── index.astro              # Homepage
│   │   ├── about.astro              # Over Ons
│   │   ├── charity.astro            # Goede Doel
│   │   ├── contact.astro            # Contact + FAQ
│   │   ├── dashboard.astro          # Deelnemersdashboard
│   │   ├── dkl.astro                # DKL informatiepagina
│   │   ├── faq.astro                # FAQ
│   │   ├── login.astro              # Inlogpagina
│   │   ├── logout.astro             # Uitloggen
│   │   ├── media.astro              # Mediagalerij
│   │   ├── profiel.astro            # Deelnemersprofiel
│   │   ├── programma.astro          # Evenementprogramma
│   │   ├── register.astro           # Inschrijfformulier
│   │   ├── registratie-succes.astro # Successpage
│   │   ├── routes.astro             # Interactieve routekaart
│   │   ├── voorwaarden.astro        # Deelnamevoorwaarden
│   │   ├── rss.xml.ts               # RSS feed
│   │   ├── admin/                   # Admin paneel (RBAC-beveiligd)
│   │   │   ├── analytics.astro
│   │   │   ├── blog.astro           # Admin only
│   │   │   ├── communicatie.astro
│   │   │   ├── dashboard.astro
│   │   │   ├── deelnemers.astro
│   │   │   ├── donaties.astro
│   │   │   ├── email.astro
│   │   │   ├── media.astro
│   │   │   ├── profiel.astro
│   │   │   ├── settings.astro       # Admin only
│   │   │   ├── social.astro
│   │   │   ├── status.astro         # Systeemstatus
│   │   │   ├── team.astro
│   │   │   └── x-poster.astro       # Admin only
│   │   ├── api/                     # Server-side API endpoints (BFF)
│   │   │   ├── [...all].ts          # Catch-all proxy naar Go backend
│   │   │   ├── send-confirmation.ts # Bevestigingsmail via Convex + Go
│   │   │   ├── sign-imagekit.ts     # ImageKit upload signature
│   │   │   ├── email-stats.ts       # Email statistieken
│   │   │   ├── auth/                # Auth proxy naar LaventeCare
│   │   │   │   ├── [...path].ts
│   │   │   │   └── logout.ts
│   │   │   ├── admin/               # Admin-specifieke endpoints
│   │   │   │   ├── imagekit-delete.ts
│   │   │   │   ├── imagekit-images.ts
│   │   │   │   ├── imap-config.ts
│   │   │   │   ├── mail-config.ts
│   │   │   │   ├── upload-image.ts
│   │   │   │   ├── email/
│   │   │   │   ├── media/
│   │   │   │   └── social/
│   │   │   ├── blog/                # Blog endpoints
│   │   │   └── email/               # Email proxy
│   │   ├── auth/                    # Auth flows
│   │   │   ├── register.astro
│   │   │   └── reset.astro
│   │   └── blog/                    # Publieke blog
│   │       ├── index.astro
│   │       └── [slug].astro
│   ├── components/
│   │   ├── admin/                   # Admin React islands (59 componenten)
│   │   │   ├── AnalyticsDashboard.tsx
│   │   │   ├── BlogManagerIsland.tsx
│   │   │   ├── BlogPostEditor.tsx
│   │   │   ├── CommunicatieManager.tsx
│   │   │   ├── DashboardStats.tsx
│   │   │   ├── DashboardTable.tsx
│   │   │   ├── EmailManagerIsland.tsx
│   │   │   ├── EventSchedule.tsx
│   │   │   ├── EventSettingsIsland.tsx
│   │   │   ├── FeedbackList.tsx
│   │   │   ├── MediaManagerIsland.tsx
│   │   │   ├── ParticipantsTable.tsx
│   │   │   ├── SocialManagerIsland.tsx
│   │   │   ├── TeamHub.tsx
│   │   │   ├── VolunteerTasksManager.tsx
│   │   │   ├── XPosterIsland.tsx
│   │   │   ├── AdminModal.tsx       # Gedeeld modal primitief
│   │   │   ├── AdminNav.astro
│   │   │   ├── AdminHeader.astro
│   │   │   └── constants.ts         # Z-Index + Limits constanten
│   │   ├── islands/                 # Publieke React islands (28 componenten)
│   │   │   ├── RegisterForm.tsx
│   │   │   ├── RegisterIsland.tsx
│   │   │   ├── LoginForm.tsx
│   │   │   ├── ParticipantDashboardWrapper.tsx
│   │   │   ├── ParticipantEditModal.tsx
│   │   │   ├── MediaLightboxModal.tsx
│   │   │   ├── RouteMap.tsx
│   │   │   ├── RouteDetailWithElevation.tsx
│   │   │   ├── FAQAccordion.tsx
│   │   │   ├── VideoShowcase.tsx
│   │   │   ├── ThemeToggle.tsx
│   │   │   ├── ContactForm.tsx
│   │   │   ├── ConvexClientProvider.tsx
│   │   │   └── ...
│   │   ├── blocks/                  # Astro blokcomponenten (12 mappen)
│   │   │   ├── Blog/
│   │   │   ├── Contact/
│   │   │   ├── DKL/
│   │   │   ├── Global/              # Navbar, Footer
│   │   │   ├── Home/                # HeroSection
│   │   │   ├── Media/               # MasonryGallery, StreamableVideo
│   │   │   ├── Overons/             # TeamSection
│   │   │   ├── Programma/
│   │   │   ├── Route/               # RouteGrid, KomootEmbed
│   │   │   ├── Social/              # SocialGrid
│   │   │   ├── Sponsors/            # SponsorCarousel
│   │   │   └── inschrijven/
│   │   ├── dashboard/               # Deelnemersdashboard componenten
│   │   ├── chat/                    # Chat componenten
│   │   ├── marketing/               # Marketing componenten
│   │   ├── profile/                 # Profielpagina componenten
│   │   ├── seo/                     # SEO componenten
│   │   └── ui/                      # Design system primitives
│   ├── layouts/
│   │   ├── BaseLayout.astro         # Public pages (favicon.webp)
│   │   └── AdminLayout.astro        # Admin dashboard shell (favicon.webp)
│   ├── lib/
│   │   ├── auth.ts                  # Auth store + logout functie
│   │   ├── api.ts                   # API client met 401-interceptor
│   │   ├── apiAuth.ts               # Server-side auth helper voor API routes
│   │   ├── analytics.ts             # Analytics tracking functions
│   │   ├── imagekit.ts              # ImageKit CDN helper (URL-builder)
│   │   ├── routeData.ts             # GPX route data (2.5/6/10/15km)
│   │   ├── sponsors.ts              # Sponsor data (Single Source of Truth)
│   │   ├── partners.ts              # Partner data
│   │   ├── sanitize.ts              # HTML sanitization (sanitize-html)
│   │   ├── toast.ts                 # Toast notifications
│   │   ├── webVitals.ts             # Web Vitals tracking
│   │   ├── ai-shared.ts             # Gedeelde AI/chat utilities
│   │   └── ...
│   ├── middleware.ts                 # Zero-Trust auth + RBAC + CSP headers
│   └── styles/
│       └── global.css               # Design tokens + Tailwind v4 config
├── convex/
│   ├── schema.ts                    # Database schema (27 tabellen)
│   ├── admin.ts                     # Admin mutations/queries
│   ├── register.ts                  # Registratie flow (authenticated)
│   ├── registerGuest.ts             # Gastregistratie flow
│   ├── claimGuest.ts                # Gast → Account upgrade
│   ├── authHelpers.ts               # Convex auth verificatie
│   ├── blog.ts                      # Blog functies
│   ├── chat.ts                      # 1-op-1 en groepschat
│   ├── donations.ts                 # Donaties
│   ├── eventSettings.ts             # Evenementinstellingen (singleton)
│   ├── feedback.ts                  # Feedback ticketsysteem
│   ├── gdpr.ts                      # GDPR/AVG dataverzoeken
│   ├── internal.ts                  # Interne server functies
│   ├── media.ts                     # Media management
│   ├── mediaMetadata.ts             # ImageKit metadata
│   ├── participant.ts               # Deelnemer queries
│   ├── prCommunicatie.ts            # PR module (organisaties + contacten)
│   ├── socialPosts.ts               # Social media posts
│   ├── socialReactions.ts           # Emoji reacties
│   ├── team.ts                      # Team hub (notulen + schema)
│   ├── analytics.ts                 # Analytics events
│   ├── crons.ts                     # Geplande taken
│   └── ...
├── docs/
│   ├── APPLICATIE_OVERZICHT.md      # Platform overzicht (niet-technisch)
│   └── EDITOR_HANDLEIDING.md        # Onboarding voor Editor-rol
├── astro.config.mjs                 # Astro + Vite + Vercel configuratie
└── convex.json                      # Convex project config (frugal-goose-15)
```

---

## Database Schema (Convex)

Het Convex schema bevat **27 tabellen**:

| Tabel | Beschrijving |
|---|---|
| `registrations` | Kern-CRM: alle inschrijvingen per editie |
| `users` | Admin/editor accounts (Convex-side) |
| `donations` | Donaties met betaalstatus en methode |
| `donation_campaigns` | GoFundMe campagnes per jaar |
| `volunteer_tasks` | Taken toegewezen aan vrijwilligers |
| `media` | Foto's (ImageKit) en video's (Streamable) met moderatiestatus |
| `media_metadata` | ImageKit alt-tekst en tags (legacy Cloudinary veldnamen) |
| `event_settings` | Singleton evenementconfiguratie |
| `leads` | E-mail leads voor marketing |
| `social_posts` | Social media posts per editie (met carousel-support) |
| `social_reactions` | Emoji-reacties van bezoekers |
| `messages` | Contactformulier berichten |
| `presence` | Realtime aanwezigheid (groene stip, heartbeat 60s) |
| `direct_messages` | 1-op-1 team chat |
| `group_conversations` | Groepsgesprekken |
| `group_messages` | Berichten in groepsgesprekken |
| `pr_organizations` | PR-database: zorgorganisaties (met sector + regio) |
| `pr_contacts` | PR-database: contactpersonen |
| `pr_send_history` | Log van PR-uitingen |
| `analytics_events` | Custom event tracking (dual-write met Vercel) |
| `team_minutes` | Vergadernotulen (concept/definitief) |
| `event_schedule` | Evenementprogramma tijdlijn |
| `feedback` | Intern feedback-ticketsysteem |
| `blog_posts` | Blog artikelen (draft/review/published/scheduled/archived) |
| `blog_categories` | Blog categorieën |
| `blog_comments` | Blog reacties (met moderatie + reply threading) |
| `blog_config` | Blog configuratie (enabled, comments, posts_per_page) |

---

## Authenticatie & Autorisatie

### Flow
1. Gebruiker logt in via `/login` → credentials naar LaventeCare Auth (Go)
2. Auth-backend retourneert JWT → opgeslagen als **HttpOnly cookie** (`dkl_auth_token` of `access_token`)
3. Astro **middleware** (`src/middleware.ts`) valideert elke request via `GET /auth/me`
4. Gebruikersrol wordt opgeslagen in `Astro.locals.user`
5. RBAC blokkeert `/admin/*` voor niet-admin/editor rollen

### Rollen (Middleware RBAC)
```
admin   → Volledige toegang tot alle routes en modules
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
- Convex account + project (`frugal-goose-15`)
- LaventeCare Auth backend (lokaal op `http://localhost:8080` of Render)

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
| `API_TARGET` | Go backend URL voor Vite proxy (dev only) |

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

Vercel configuratie (`astro.config.mjs`):
- `webAnalytics: { enabled: true }` — Vercel Web Analytics
- `speedInsights: { enabled: true }` — Vercel Speed Insights
- `maxDuration: 60` — max serverless function timeout
- `imagesConfig` — ImageKit CDN als geoptimaliseerde image source

### Vite Proxy (Development)
Lokaal worden `/api/v1` en `/api/email` requests geproxied naar de Go backend:

```js
// astro.config.mjs
proxy: {
  '/api/v1': { target: process.env.API_TARGET || 'http://localhost:8080' },
  '/api/email': { target: process.env.API_TARGET || 'http://localhost:8080' }
}
```

---

## Beveiligingsmaatregelen

- **Zero-Trust:** Elke server-side route valideert het auth-token opnieuw via `/auth/me`
- **HttpOnly cookies:** Tokens niet toegankelijk via `document.cookie`
- **RBAC Middleware:** Paginaniveau-bescherming in `middleware.ts`
- **CSP Headers:** Strikte Content Security Policy op elke response (ImageKit, Convex, Streamable, Komoot, GoFundMe)
- **X-Frame-Options:** `DENY` in productie, `SAMEORIGIN` in development
- **X-Content-Type-Options:** `nosniff` op elke response
- **Input sanitization:** `sanitize-html` voor HTML content in blog/editor

---

## Documentatie

| Document | Beschrijving |
|---|---|
| [APPLICATIE_OVERZICHT.md](./docs/APPLICATIE_OVERZICHT.md) | Platform overzicht voor team (niet-technisch) |
| [EDITOR_HANDLEIDING.md](./docs/EDITOR_HANDLEIDING.md) | Onboarding handleiding voor de Editor-rol |
| [CONVEX_SETUP.md](./CONVEX_SETUP.md) | Convex environment setup |

---

*De Koninklijke Loop · Maart 2026 · [dekoninklijkeloop.nl](https://dekoninklijkeloop.nl)*
