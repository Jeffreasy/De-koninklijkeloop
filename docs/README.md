# 📚 De Koninklijke Loop — Documentatie

> **Platform:** [dekoninklijkeloop.nl](https://dekoninklijkeloop.nl) · **Versie:** 2026 · **Stack:** Astro 5 + Convex + Go (LaventeCare)

Welkom in de centrale documentatie van het DKL-platform. Gebruik de secties hieronder om snel de juiste informatie te vinden.

---

## 🗺️ Navigatiegids

### 📦 [00 — Project](./00-project/overview.md)
Wat is DKL, projectdoelen, roadmap en architectuurbeslissingen (ADRs).

| Document | Beschrijving |
|---|---|
| [overview.md](./00-project/overview.md) | Platform overzicht, features, rollen |
| [roadmap.md](./00-project/roadmap.md) | Feature roadmap en backlog |
| [ADR-001 Hybrid Data Strategy](./00-project/adr/ADR-001-hybrid-data-strategy.md) | Waarom Convex + Go samen |

---

### 🚀 [01 — Getting Started](./01-getting-started/prerequisites.md)
Voor nieuwe developers: van nul naar lokale dev-omgeving.

| Document | Beschrijving |
|---|---|
| [prerequisites.md](./01-getting-started/prerequisites.md) | Vereiste tools en versies |
| [local-development.md](./01-getting-started/local-development.md) | Stap-voor-stap setup |
| [environment-variables.md](./01-getting-started/environment-variables.md) | Alle .env variabelen |

---

### 🏗️ [02 — Architecture](./02-architecture/system-overview.md)
Technische architectuur, systeemdiagrammen en design decisions.

| Document | Beschrijving |
|---|---|
| [system-overview.md](./02-architecture/system-overview.md) | Volledig systeemdiagram + tech stack |
| [frontend-architecture.md](./02-architecture/frontend-architecture.md) | Astro SSR, Islands, Nano Stores |
| [data-layer.md](./02-architecture/data-layer.md) | Convex schema + hybrid pattern |
| [security-model.md](./02-architecture/security-model.md) | Zero-Trust, RBAC, CSP headers |
| [performance.md](./02-architecture/performance.md) | Video Facade, caching, Web Vitals |

---

### 🎨 [03 — Frontend](./03-frontend/design-system.md)
Design systeem, component bibliotheek en pagina-overzicht.

| Document | Beschrijving |
|---|---|
| [design-system.md](./03-frontend/design-system.md) | Kleurenpalet, typografie, tokens |
| [components.md](./03-frontend/components.md) | Component bibliotheek overzicht |
| [pages.md](./03-frontend/pages.md) | Alle routes + pagina-doel |
| [forms.md](./03-frontend/forms.md) | Registratieform, login, contactform |

---

### 🛠️ [04 — Admin Dashboard](./04-admin/dashboard.md)
Handleiding voor alle admin modules. Zie ook [`EDITOR_HANDLEIDING.md`](./EDITOR_HANDLEIDING.md) voor eindgebruikers.

| Document | Module |
|---|---|
| [dashboard.md](./04-admin/dashboard.md) | Statistieken, KPIs, live feed |
| [registrations.md](./04-admin/registrations.md) | CRM deelnemers, bulkbewerking |
| [media.md](./04-admin/media.md) | ImageKit CDN, upload, moderatie |
| [email.md](./04-admin/email.md) | Inbox, SMTP/IMAP, audit trail |
| [social-media.md](./04-admin/social-media.md) | Posts, carousel, X Poster |
| [blog.md](./04-admin/blog.md) | TipTap editor, statussen, SEO |
| [pr-communication.md](./04-admin/pr-communication.md) | Organisatiedb, BCC-generator |
| [team.md](./04-admin/team.md) | Notulen, programma, vrijwilligerstaken |
| [chat.md](./04-admin/chat.md) | SSE chat, groepen, aanwezigheid |
| [analytics.md](./04-admin/analytics.md) | Website statistieken, CSV export |
| [donations.md](./04-admin/donations.md) | GoFundMe integratie, campagnes |
| [settings.md](./04-admin/settings.md) | Evenement- & systeeminstellingen |

---

### 🗄️ [05 — Convex Data Layer](./05-convex/overview.md)
Technische referentie voor het Convex realtime backend systeem.

| Document | Beschrijving |
|---|---|
| [overview.md](./05-convex/overview.md) | Wat is Convex, queries, mutations, actions |
| [schema.md](./05-convex/schema.md) | Volledige tabelstructuur |
| [modules.md](./05-convex/modules.md) | Alle 37 modules gedocumenteerd |

---

### ⚙️ [06 — Backend (LaventeCare Go)](./06-backend/README.md)
De volledige Go backend documentatie staat in `/Backenddocs/`.

| Document | Beschrijving |
|---|---|
| [06-backend/README.md](./06-backend/README.md) | Verwijzing naar Backenddocs/ |
| [Backenddocs/01 Architecture & Security](../Backenddocs/01_architecture_security.md) | IAM, RBAC, JWT, RLS |
| [Backenddocs/02 API Integration](../Backenddocs/02_api_integration.md) | Alle API endpoints |
| [Backenddocs/03 Operations Runbook](../Backenddocs/03_operations_runbook.md) | Docker, Render, environment |
| [Backenddocs/04 Development & Testing](../Backenddocs/04_development_testing.md) | Lokale setup, tests |
| [Backenddocs/05 Tools Reference](../Backenddocs/05_tools_reference.md) | Scripts, tools |

---

### 🚢 [07 — Deployment](./07-deployment/overview.md)
Productie-deployments, Vercel configuratie en pre-deploy checklists.

| Document | Beschrijving |
|---|---|
| [overview.md](./07-deployment/overview.md) | Productie stack overzicht |
| [vercel.md](./07-deployment/vercel.md) | Frontend deployment op Vercel |
| [docker.md](./07-deployment/docker.md) | Lokale Docker Compose |
| [checklist.md](./07-deployment/checklist.md) | Pre-deploy checklist |

---

### 🧪 [08 — Testing](./08-testing/overview.md)
Test strategie, tools en Playwright E2E.

| Document | Beschrijving |
|---|---|
| [overview.md](./08-testing/overview.md) | Test strategie en piramide |
| [e2e.md](./08-testing/e2e.md) | Playwright E2E tests |

---

### 🤝 [09 — Contributing](./09-contributing/code-style.md)
Code conventies, Git workflow en PR review processI.

| Document | Beschrijving |
|---|---|
| [code-style.md](./09-contributing/code-style.md) | Code conventies en clean-code |
| [git-workflow.md](./09-contributing/git-workflow.md) | Branch strategie, commit messages |
| [review-checklist.md](./09-contributing/review-checklist.md) | PR review checklist |

---

## 👥 Team Contacten

| Rol | Naam | E-mail |
|---|---|---|
| Technisch beheerder | Jeffrey | jeffrey@dekoninklijkeloop.nl |
| Editor | Ron | ron@dekoninklijkeloop.nl |
| Editor | Salih | salih@dekoninklijkeloop.nl |
| Editor | Marieke | marieke@dekoninklijkeloop.nl |
| Editor | Lidah | lidah@dekoninklijkeloop.nl |
| Editor | Ginelly | ginelly@dekoninklijkeloop.nl |
| Editor | Angelique | angelique@dekoninklijkeloop.nl |

---

*Laatste update: Maart 2026 · [Bijdragen?](./09-contributing/git-workflow.md)*
