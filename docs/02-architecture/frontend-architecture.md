# Frontend Architecture — Astro, Islands & State

## Rendering Strategie

Het DKL frontend gebruikt **Astro SSR/Hybrid** rendering:

| Mode | Gebruik | Voordeel |
|---|---|---|
| **SSR** (Server-Side) | Beveiligde pagina's, admin panel | Auth-check in middleware, geen client-side secrets |
| **Static** | Publieke content pagina's | Maximale performance, CDN-cached |
| **Islands** | Interactieve UI-componenten | Partiele hydration — minimaal JS |

---

## Mapstructuur Frontend

```
src/
├── components/
│   ├── admin/          # 60+ admin React componenten
│   ├── blocks/         # Pagina-secties (Blog, Contact, DKL, Home, Media, etc.)
│   ├── chat/           # Chat UI componenten
│   ├── islands/        # React Islands (publiek toegankelijk)
│   ├── ui/             # Herbruikbare UI primitieven
│   └── seo/            # SEO meta componenten
├── layouts/
│   ├── BaseLayout.astro     # Hoofd layout (head, nav, footer, theme)
│   └── AdminLayout.astro    # Admin panel layout
├── pages/
│   ├── index.astro          # Homepage
│   ├── admin/               # Admin panel pagina's
│   ├── api/                 # Server-side API routes
│   └── [...]                # Publieke pagina's
├── lib/                     # Utilities en service clients
├── config/                  # Site configuratie
├── data/                    # Statische data (sponsors, partners, routes)
├── types/                   # TypeScript type definities
└── styles/                  # Globale CSS
```

---

## Islands Pattern

React Islands worden gebruikt voor **interactieve onderdelen** die client-side state of realtime data nodig hebben.

### Gebruik in Astro pagina's

```astro
---
import RegisterIsland from '../components/islands/RegisterIsland.tsx';
---
<RegisterIsland client:load />
```

### Island Hydration Modi

| Directive | Wanneer | Gebruik |
|---|---|---|
| `client:load` | Direct bij page load | Kritieke UI (login, registratie) |
| `client:idle` | Als browser idle is | Minder urgente componenten |
| `client:visible` | Als zichtbaar in viewport | Media, media lightbox |
| `client:only="react"` | Alleen client-side | Admin componenten (geen SSR) |

### Publieke Islands

| Component | Gebruik |
|---|---|
| `RegisterIsland.tsx` | Volledig inschrijfformulier (52KB — complex) |
| `LoginForm.tsx` | Inloggen + MFA flow |
| `ParticipantDashboardWrapper.tsx` | Persoonlijk deelnemersdashboard |
| `RouteMap.tsx` / `RouteDetailWithElevation.tsx` | Leaflet interactieve kaart |
| `MediaLightboxModal.tsx` | Foto lightbox |
| `VideoShowcase.tsx` | Jaar-switching aftermovies |
| `FAQAccordion.tsx` | Uitklapbare FAQ |
| `ContactForm.tsx` | Contactformulier |
| `SystemStatus.tsx` | Service health indicator |
| `ThemeToggle.tsx` | Dark/Light theme wisseling |

---

## State Management — Nano Stores

Voor gedeelde state tussen islands wordt **Nano Stores** gebruikt (geen Redux, geen Context boilerplate):

```typescript
// Voorbeeld: theme store
import { atom } from 'nanostores';
export const themeStore = atom<'dark' | 'light'>('dark');
```

Nano Stores is framework-agnostisch — werkt zowel in `.astro` als in React Islands.

---

## Middleware & Auth Flow

```
src/middleware.ts
```

De middleware draait op **elke server-side request** (behalve statische assets, `/api/**`, `/logout`, en prerendered pagina's) en:
1. Leest het `dkl_auth_token` of `access_token` HttpOnly cookie
2. Roept `GET ${PUBLIC_API_URL}/auth/me` aan met `X-Tenant-ID` header (`PUBLIC_TENANT_ID`)
3. Injecteert `Astro.locals.user` met rol en gebruikersinformatie
4. Normaliseert `full_name` → `name` en lowercase bijhouden van rol
5. Redirect naar `/login` als niet geauthenticeerd (beschermde routes)

### Route Bescherming

```typescript
// Beschermde routes in middleware.ts
const protectedRoutes = ["/admin", "/dashboard", "/profile"];

// Admin + Editor toegang tot /admin/**
// Admin ONLY voor /admin/settings/**
```

---

## Configuratie — Site Config

```
src/config/site.config.ts
```

Single source of truth voor:
- Site naam, URL, branding
- Navigatie menu items
- Beschikbare afstanden (2.5/6/10/15km)
- Social media links

---

## API Routes

```
src/pages/api/
```

Astro server-side API routes fungeren als **proxy** naar de Go backend. Ze:
- Voegen auth headers toe (lezen HttpOnly cookie)
- Valideren input voor forwarding
- Isoleren de Go backend URL van de browser

---

*← [system-overview.md](./system-overview.md) · Volgende: [data-layer.md](./data-layer.md)*
