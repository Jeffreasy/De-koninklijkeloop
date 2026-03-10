# De Koninklijke Loop — Platform Overzicht

> **Versie 2026** · [dekoninklijkeloop.nl](https://dekoninklijkeloop.nl) · Apeldoorn

## Wat is De Koninklijke Loop?

**De Koninklijke Loop (DKL)** is een inclusief wandelevenement in Apeldoorn waarbij deelnemers, begeleiders en vrijwilligers samen wandelen voor een goed doel. De bijbehorende webapplicatie is het complete digitale platform dat het hele evenement ondersteunt — van inschrijving tot communicatie tot media-archief.

**Evenementdatum:** Zaterdag 16 mei 2026  
**Locatie:** Kootwijk - Apeldoorn  
**Afstanden:** 2,5 km · 6 km · 10 km · 15 km  
**Goed doel:** Only Friends  

---

## Platform Doelstellingen

| Doel | Implementatie |
|---|---|
| Online inschrijvingen | Registratieformulier met gast & account flow |
| Donatiebeheer | GoFundMe-integratie met live widget |
| Mediabeheer | ImageKit CDN (foto's) + Streamable (video's) |
| Social media & PR | X Poster + Communicatiemodule |
| Realtime administratie | Admin dashboard met Convex real-time data |
| Interne samenwerking | Chat (SSE), notulen, vrijwilligerstaken |
| Evenementprogramma | Chronologisch schema met routekoppeling |

---

## Technologie Stack

| Laag | Technologie | Versie |
|---|---|---|
| **Frontend Framework** | Astro (SSR/Hybrid) | 5+ |
| **Styling** | Tailwind CSS | v4 |
| **React Islands** | React + Nano Stores | 19+ |
| **Realtime Data** | Convex | Latest |
| **Backend (IAM)** | Go + LaventeCare Auth | 1.22+ |
| **Database** | PostgreSQL | 16+ |
| **Media CDN** | ImageKit | - |
| **Deployment** | Vercel (frontend) + Render (backend) | - |

---

## Systeem Componenten

### 🌐 Publieke Website
Toegankelijk voor iedereen zonder account:

| Pagina | URL | Doel |
|---|---|---|
| Homepage | `/` | Intro, videoshowcase, registratieknop |
| Over Ons | `/about` | Achtergrond evenement en team |
| DKL Info | `/dkl` | Informatie over De Koninklijke Loop |
| Programma | `/programma` | Evenementprogramma tijdlijn |
| Routekaart | `/routes` | Interactieve Leaflet kaart (2.5/6/10/15km) |
| Media | `/media` | Fotogalerij + aftermovies vorige edities |
| Goede Doel | `/charity` | GoFundMe widget + uitleg doel (Only Friends) |
| Blog | `/blog` | Nieuws en updates |
| FAQ | `/faq` | Veelgestelde vragen |
| Contact | `/contact` | Contactformulier |
| Voorwaarden | `/voorwaarden` | Deelnamevoorwaarden + privacybeleid |
| Inschrijven | `/register` | Online inschrijfformulier |

### 🔐 Authenticatie
- `/login` — Inloggen met LaventeCare account
- `/dashboard` — Persoonlijk deelnemersdashboard
- `/profiel` — Profielinformatiepagina

### 🛠️ Admin Panel
Bereikbaar via `/admin/dashboard` voor Administrators en Editors.  
→ Zie [Admin sectie](../04-admin/dashboard.md) voor volledige documentatie.

---

## Rollen & Toegang

| Rol | Omschrijving | Toegang |
|---|---|---|
| **Administrator** | Volledig beheer | Admin-paneel + alle modules |
| **Editor** | Dagelijks beheer | Admin-paneel (beperkt) |
| **Deelnemer** | Ingeschreven wandelaar | Eigen dashboard + profiel |
| **Begeleider** | Begeleidt deelnemer | Eigen dashboard + profiel |
| **Vrijwilliger** | Helpt op evenementsdag | Eigen dashboard + profiel |

### Administrator heeft toegang tot:
- Systeem- en evenementinstellingen (`/admin/settings`)
- Blog beheren (`/admin/blog`)
- X (Twitter) campagnes (`/admin/x-poster`)
- Feedback-tickets verwerken
- Alle Editor-functies

### Editor heeft toegang tot:
- Dashboard en Analytics
- Inschrijvingen bekijken en bevestigingen sturen
- E-mailboxen beheren (inbox, archief, beantwoorden)
- Media uploaden en modereren
- Social media posts plannen
- PR-contacten en communicatie beheren
- Team notulen, dagplanning en vrijwilligerstaken
- Donatie-overzicht bekijken

> 📄 Zie **[EDITOR_HANDLEIDING.md](../EDITOR_HANDLEIDING.md)** voor de volledige Nederlandstalige handleiding.

---

## Beveiliging (samenvatting)

- **Zero-Trust authenticatie** via LaventeCare Auth backend (`/auth/me`)
- **RBAC** op middleware-niveau: ongeautoriseerde toegang wordt geblokkeerd
- **HttpOnly cookies** — sessietokens niet toegankelijk via JavaScript
- **Content Security Policy (CSP)** — strikte whitelist van externe bronnen
- **RS256 JWT** access tokens + roterende refresh tokens

→ Zie [security-model.md](../02-architecture/security-model.md) voor details.

---

## Team Contacten

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

*← [Terug naar docs/README.md](../README.md)*
