# De Koninklijke Loop — Platform Documentatie

> **Versie 2026** · Deployed op [dekoninklijkeloop.nl](https://dekoninklijkeloop.nl) · Beheerd door het DKL-kernteam

---

## Inhoudsopgave

1. [Wat is De Koninklijke Loop?](#wat-is-de-koninklijke-loop)
2. [Publieke Website](#publieke-website)
3. [Rollen & Toegang](#rollen--toegang)
4. [Admin Dashboard — Moduleoverzicht](#admin-dashboard--moduleoverzicht)
5. [Deelnemers & Bezoekers](#deelnemers--bezoekers)
6. [Beveiliging](#beveiliging)
7. [Contacten & Support](#contacten--support)

---

## Wat is De Koninklijke Loop?

**De Koninklijke Loop** is een inclusief wandelevenement in Apeldoorn waarbij deelnemers, begeleiders en vrijwilligers samen wandelen voor een goed doel. De bijbehorende webapplicatie is het complete digitale platform voor:

- 📝 **Online inschrijvingen** voor deelnemers, begeleiders en vrijwilligers
- 💰 **Donatiebeheer** via GoFundMe-integratie
- 🖼️ **Mediabeheer** voor foto's (ImageKit CDN) en video's (Streamable)
- 📣 **Social media** en PR-communicatie
- 📊 **Real-time administratie** voor het organisatieteam
- 💬 **Interne teamsamenwerking** via chat, notulen en vrijwilligerstaakbeheer

**Evenementdatum:** zaterdag 16 mei 2026
**Locatie:** Apeldoorn
**Afstanden:** 2,5 km · 6 km · 10 km · 15 km
**Platform:** Universeel responsive (Computer, Tablet, Smartphone)

---

## Publieke Website

De publieke website is toegankelijk voor iedereen zonder inloggen:

| Pagina | URL | Beschrijving |
|---|---|---|
| **Homepage** | `/` | Introductie, videoshowcase en registratieknop |
| **Over Ons** | `/about` | Achtergrond van het evenement en het team |
| **DKL Info** | `/dkl` | Informatie over De Koninklijke Loop |
| **Programma** | `/programma` | Tijdlijn en schema van de evenementsdag |
| **Routekaart** | `/routes` | Interactieve Leaflet kaart met alle looproutes (2.5/6/10/15km) |
| **Media** | `/media` | Fotogalerij (ImageKit) en video's (Streamable) van vorige edities |
| **Goede Doel** | `/charity` | Informatie over de inzamelingsactie + GoFundMe widget |
| **Blog** | `/blog` | Nieuws en updates over het evenement |
| **FAQ** | `/faq` | Veelgestelde vragen |
| **Contact** | `/contact` | Contactformulier en contactinformatie |
| **Voorwaarden** | `/voorwaarden` | Deelnamevoorwaarden en privacybeleid |
| **Inschrijven** | `/register` | Online inschrijfformulier (gast of account) |
| **Succes** | `/registratie-succes` | Bevestiging na succesvolle inschrijving |

---

## Rollen & Toegang

Het platform werkt met een rollenstructuur. Elke gebruiker heeft één rol die bepaalt wat ze kunnen zien en doen.

| Rol | Omschrijving | Toegang |
|---|---|---|
| **Administrator** | Volledig beheer van het platform | Admin-paneel + alle modules |
| **Editor** | Dagelijks beheer van communicatie en deelnemers | Admin-paneel (beperkt) |
| **Deelnemer** | Ingeschreven wandelaar | Eigen dashboard + profiel |
| **Begeleider** | Begeleidt een deelnemer | Eigen dashboard + profiel |
| **Vrijwilliger** | Helpt op evenementsdag | Eigen dashboard + profiel |

### Wat kan elke rol?

#### 👑 Administrator
Heeft toegang tot **alle** modules inclusief:
- Systeem- en evenementinstellingen (`/admin/settings`)
- Blog beheren (`/admin/blog`)
- X (Twitter) campagnes (`/admin/x-poster`)
- Feedback-tickets verwerken
- Alle Editor-functies

#### ✏️ Editor
Heeft toegang tot de dagelijkse admin-modules:
- Dashboard en Analytics
- Inschrijvingen bekijken en bevestigingen sturen
- E-mailboxen beheren
- Media uploaden en modereren
- Social media posts plannen
- PR-contacten en communicatie beheren
- Team notulen, dagplanning en vrijwilligerstaken
- Donatie-overzicht bekijken

> 📄 Zie **[EDITOR_HANDLEIDING.md](./EDITOR_HANDLEIDING.md)** voor de volledige Nederlandstalige handleiding voor het editorteam.

#### 🧑 Deelnemer / Begeleider / Vrijwilliger
Heeft alleen toegang tot het persoonlijke deelnemersdashboard (`/dashboard`):
- Eigen inschrijving bekijken
- Profielgegevens aanpassen
- Uitloggen

---

## Admin Dashboard — Moduleoverzicht

Het admin-paneel is bereikbaar via `/admin/dashboard` voor Administrators en Editors.

### 📊 Dashboard
- **Live inschrijvingstabel** met filter op editie (2025 / 2026)
- **KPI-kaarten:** totaal deelnemers, nieuw vandaag, rolverdeling
- **Live activiteitsfeed:** meest recente aanmeldingen in realtime
- **Afstand populariteit:** verdeling per route (2.5/6/10/15km)
- **Revenue tracking:** geschatte opbrengst op basis van betaalde inschrijvingen

### 📈 Analytics
- **Websitestatistieken** van dekoninklijkeloop.nl
- KPI-kaarten: bezoekers, unieke sessies, gemiddelde sessieduur, bouncepercentage
- Grafiek met bezoekerstrend over tijd
- Populairste pagina's, apparaattypen, verwijzende websites
- Periode-filter: 7 · 30 · 90 dagen
- **CSV export** van alle data

### 👥 Inschrijvingen
- Volledig CRM voor alle aanmeldingen per editie
- Filteren op naam, e-mail, rol, type (account of gast)
- Detailmodal: volledige deelnemersinformatie inclusief noodcontact, t-shirtmaat en waiverstatus
- Bevestigingsmail versturen per deelnemer
- Bulkbewerking: markeren als betaald, editie wijzigen
- Bijhouden wanneer bevestiging verstuurd is (en door wie)

### 💰 Donaties
- Live donatie-widget (GoFundMe-integratie)
- Doelstelling en huidige stand per campagne
- Beheerpaneel voor campagne-instellingen per jaar (2025/2026)

### ✉️ Email
- Twee mailboxen: `info@dekoninklijkeloop.nl` en `inschrijving@dekoninklijkeloop.nl`
- Inbox en archiefweergave per mailbox
- E-mails lezen, beantwoorden, archiveren en als gelezen/ongelezen markeren
- Nieuwe e-mails opstellen
- Automatische verversing elke 60 seconden
- Persoonlijke DKL-mailboxen via [Hostnet Webmail](https://appsuite.hostnet.nl/appsuite/ui)

### 🖼️ Media
- Overzicht van alle foto's (via ImageKit CDN)
- Filteren op map en jaar (2024 / 2025)
- Bestanden uploaden via ImageKit Upload (server-side signed request)
- Metadata bewerken: alt-tekst en tags
- Moderatiestatus: **pending** · **approved** · **rejected** · **archived**

### 📣 Social Media
- Posts aanmaken met tekst, afbeeldingen of video's
- Carousel-posts met meerdere media-items (foto's en/of video)
- Inplannen voor publicatie (datum/tijd)
- Overzicht van alle posts per jaar
- Emoji-reacties van websitebezoekers worden bijgehouden per post

### 📢 Communicatie (PR-module)
- **Organisatiedatabase:** ziekenhuizen, GGZ, revalidatie, gehandicaptenzorg (sector + regio filter)
- **Contactendatabase:** individuele contactpersonen per organisatie
- **BCC-generator:** kopieer gefilterde e-maillijsten naar klembord voor externe mailing
- **Verzendhistorie:** log van alle PR-uitingen met timestamp en ontvangersaantal

### 👫 Team
- **Notulen & vergaderstukken** — aanmaken, bewerken, opslaan als concept of definitief
- **Evenementprogramma** — chronologisch schema met tijdslots en routekoppeling
- **Vrijwilligerstaken** — toewijzen aan vrijwilligers, statussen bijhouden (Toegewezen / Bevestigd / Afgerond)

### 💬 Interne Chat (zijbalk)
- **1-op-1 directe berichten** tussen teamleden
- **Groepsgesprekken** voor teamcoördinatie
- **Realtime aanwezigheid** (groene stip = online, heartbeat elke 60s)
- Emoji-reacties op berichten

### 📰 Blog *(Administrator only)*
- Blog posts aanmaken en bewerken met rich-text editor (TipTap v3)
- Statussen: **concept** · **review** · **gepubliceerd** · **ingepland** · **gearchiveerd**
- Categorieën en tags
- SEO-velden (titel, beschrijving)
- Reacties modereren (goedkeuren / afwijzen)

### ⚙️ Instellingen *(Administrator only)*
- Evenementinformatie (naam, datum, locatie, beschikbare afstanden)
- Inschrijvingen openen/sluiten (toggle)
- E-mailinstellingen en SMTP-configuratie
- IMAP-configuratie per mailbox
- **Feedback-tickets** van gebruikers beheren (open/in behandeling/gesloten)

### 📊 Systeemstatus
- Overzicht van de gezondheid van externe services (Auth, Convex, ImageKit, Go backend)
- Zichtbaar voor admin en editor

### 🐦 X Poster *(Administrator only)*
- X (Twitter) campagnes beheren
- Posts plannen en publiceren via de X API

---

## Deelnemers & Bezoekers

### Inschrijfproces
1. Bezoeker gaat naar `/register`
2. Kiest rol: **deelnemer**, **begeleider** of **vrijwilliger**
3. Vult persoonlijke gegevens, noodcontact en voorkeuren in (pendelbus, rolstoelgebruik, etc.)
4. Kiest optioneel voor een account (standaard: gastregistratie zonder wachtwoord)
5. Accepteert deelnamevoorwaarden en mediabeleid
6. Ontvangt een automatische bevestigingsmail

### Registratietypes
| Type | Omschrijving |
|---|---|
| **Gast** | Ingeschreven zonder account (standaard, laagste drempel) |
| **Account** | Ingelogde gebruiker met een LaventeCare-account + deelnemersdashboard |

### Deelnemersdashboard (`/dashboard`)
Na inloggen kunnen deelnemers:
- Eigen inschrijving bekijken
- Profielgegevens aanpassen
- Uitloggen

---

## Beveiliging

- **Zero-Trust authenticatie:** elke request wordt gevalideerd via de LaventeCare auth-backend (`/auth/me`)
- **RBAC (rolgebaseerde toegangscontrole):** middleware blokkeert ongeautoriseerde toegang op pagina-niveau
- **HttpOnly cookies:** sessietokens zijn niet toegankelijk via JavaScript
- **Content Security Policy (CSP):** strikte headers blokkeren ongewenste scripts en requests (ImageKit, Convex, Streamable, Komoot, GoFundMe, Vercel)
- **X-Frame-Options:** DENY op productie, SAMEORIGIN in development
- **X-Content-Type-Options:** nosniff op alle responses

---

## Contacten & Support

| Rol | Naam | Contact |
|---|---|---|
| Technisch beheerder | Jeffrey | jeffrey@dekoninklijkeloop.nl |
| Editor | Ron | ron@dekoninklijkeloop.nl |
| Editor | Salih | salih@dekoninklijkeloop.nl |
| Editor | Marieke | marieke@dekoninklijkeloop.nl |
| Editor | Lidah | lidah@dekoninklijkeloop.nl |
| Editor | Ginelly | ginelly@dekoninklijkeloop.nl |
| Editor | Angelique | angelique@dekoninklijkeloop.nl |

---

*De Koninklijke Loop — Platform Documentatie · Maart 2026*
