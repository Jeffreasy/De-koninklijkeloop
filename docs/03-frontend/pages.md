# Pagina's & Routes — Volledig Overzicht

## Publieke Pagina's

| Route | Bestand | Beschrijving | Auth |
|---|---|---|---|
| `/` | `index.astro` | Homepage — hero, videoshowcase, registratieknop | Publiek |
| `/about` | `about.astro` | Over het evenement en team | Publiek |
| `/dkl` | `dkl.astro` | DKL informatie en achtergrond | Publiek |
| `/programma` | `programma.astro` | Evenementprogramma tijdlijn | Publiek |
| `/routes` | `routes.astro` | Interactieve Leaflet kaart met 4 afstanden | Publiek |
| `/media` | `media.astro` | Fotogalerij + aftermovie videos | Publiek |
| `/charity` | `charity.astro` | Goede doel info + GoFundMe widget | Publiek |
| `/blog` | `blog/index.astro` | Blog overzicht | Publiek |
| `/blog/[slug]` | `blog/[slug].astro` | Individuele blog post | Publiek |
| `/faq` | `faq.astro` | FAQ accordion | Publiek |
| `/contact` | `contact.astro` | Contactformulier | Publiek |
| `/voorwaarden` | `voorwaarden.astro` | Deelnamevoorwaarden + privacybeleid (49KB) | Publiek |
| `/register` | `register.astro` | Inschrijfformulier | Publiek |
| `/registratie-succes` | `registratie-succes.astro` | Bevestigingspagina na inschrijving | Publiek |

---

## Authenticatie Pagina's

| Route | Bestand | Beschrijving |
|---|---|---|
| `/login` | `login.astro` | Inlogformulier + MFA flow |
| `/logout` | `logout.astro` | Uitloggen + cookie clearen + redirect |
| `/auth/register` | `auth/register.astro` | Account registratie |
| `/auth/reset` | `auth/reset.astro` | Wachtwoord reset flow |

---

## Deelnemer Pagina's (Vereist: ingelogd)

| Route | Bestand | Beschrijving |
|---|---|---|
| `/dashboard` | `dashboard.astro` | Persoonlijk deelnemersdashboard |
| `/profiel` | `profiel.astro` | Profielinformatie |

> **Let op:** De middleware beschermt ook `/profile` (Engels), maar de Astro pagina heet `/profiel` (Nederlands).

---

## Admin Pagina's (Vereist: `editor` of `admin` rol)

| Route | Bestand | Beschrijving | Min. Rol |
|---|---|---|---|
| `/admin/dashboard` | `admin/dashboard.astro` | Hoofddashboard + live inschrijvingstabel | editor |
| `/admin/analytics` | `admin/analytics.astro` | Websitestatistieken | editor |
| `/admin/deelnemers` | `admin/deelnemers.astro` | Deelnemersbeheer (CRM) | editor |
| `/admin/media` | `admin/media.astro` | Mediabeheer (ImageKit) | editor |
| `/admin/email` | `admin/email.astro` | Email inbox en beheer | editor |
| `/admin/social` | `admin/social.astro` | Social media posts | editor |
| `/admin/communicatie` | `admin/communicatie.astro` | PR communicatie module | editor |
| `/admin/team` | `admin/team.astro` | Team hub (notulen, taken, programma) | editor |
| `/admin/donaties` | `admin/donaties.astro` | Donatiebeheer | editor |
| `/admin/blog` | `admin/blog.astro` | Blog beheer | **admin** |
| `/admin/x-poster` | `admin/x-poster.astro` | X (Twitter) campagnes | **admin** |
| `/admin/settings` | `admin/settings.astro` | Evenement- en systeeminstellingen | **admin** |
| `/admin/status` | `admin/status.astro` | Systeemstatus | editor |
| `/admin/profiel` | `admin/profiel.astro` | Admin profiel | editor |

---

## API Routes (Server-side)

Astro API routes en proxy-routes:

| Route | Methode | Doel |
|---|---|---|
| `/api/auth/[...path]` | GET/POST | Proxy naar LaventeCare `/auth/*` endpoints |
| `/api/auth/logout` | POST | Uitloggen + cookies clearen |
| `/api/send-confirmation` | POST | Bevestigingsmail versturen (22KB logica) |
| `/api/sign-imagekit` | GET | ImageKit upload token genereren |
| `/api/email-stats` | GET | Email statistieken |
| `/api/admin/mail-config` | GET/POST | Mail configuratie ophalen/opslaan |
| `/api/admin/imap-config` | GET/POST | IMAP configuratie |
| `/api/admin/upload-image` | POST | Server-side image upload |
| `/api/admin/imagekit-images` | GET | ImageKit afbeeldingen ophalen |
| `/api/admin/imagekit-delete` | DELETE | ImageKit afbeelding verwijderen |

> **Note:** De Vite dev proxy stuurt `/api/v1` en `/api/email` requests direct door naar de Go backend op `localhost:8080`.

---

## Sitemap Uitsluitingen

De sitemap (via `@astrojs/sitemap`) sluit automatisch uit:
- `/admin/**`
- `/auth/**`
- `/login`
- `/dashboard`
- `/profiel`
- `/registratie-succes`

---

## RSS Feed

| Route | Doel |
|---|---|
| `/rss.xml` | RSS feed van blog posts |

---

*← [components.md](./components.md) · Volgende: [forms.md](./forms.md)*
