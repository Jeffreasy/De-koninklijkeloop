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
- 🖼️ **Mediabeheer** voor foto's en video's van het evenement
- 📣 **Social media** en PR-communicatie
- 📊 **Real-time administratie** voor het organisatieteam

**Evenementdatum:** zaterdag 16 mei 2026
**Locatie:** Apeldoorn
**Afstanden:** 2,5 km · 6 km · 10 km · 15 km
**Platform:** Universeel responsive (Computer, Tablet, Smartphone)

---

## Publieke Website

De publieke website is toegankelijk voor iedereen zonder inloggen:

| Pagina | URL | Beschrijving |
|---|---|---|
| **Homepage** | `/` | Introductie, video en registratieknop |
| **Over Ons** | `/about` | Achtergrond van het evenement |
| **Programma** | `/programma` | Tijdlijn en schema van de evenementsdag |
| **Routekaart** | `/routes` | Interactieve kaart met alle looproutes |
| **Media** | `/media` | Fotogalerij en video's van vorige edities |
| **Goede Doel** | `/charity` | Informatie over de inzamelingsactie |
| **Blog** | `/blog` | Nieuws en updates over het evenement |
| **FAQ** | `/faq` | Veelgestelde vragen |
| **Contact** | `/contact` | Contactformulier |
| **Voorwaarden** | `/voorwaarden` | Deelnamevoorwaarden en privacybeleid |
| **Inschrijven** | `/register` | Online inschrijfformulier |

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
- Systeem- en e-mailinstellingen
- Blog beheren
- X (Twitter) campagnes
- Gebruikersbeheer
- Feedback-tickets verwerken

#### ✏️ Editor
Heeft toegang tot de meeste dagelijkse modules:
- Inschrijvingen bekijken en bevestigingen sturen
- E-mailboxen beheren
- Media uploaden
- Social media posts plannen
- PR-contacten en communicatie beheren
- Team notulen en vrijwilligerstaken

> 📄 Zie **[EDITOR_HANDLEIDING.md](./EDITOR_HANDLEIDING.md)** voor de volledige Nederlandstalige handleiding voor Ron.

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
- **Afstand populariteit:** verdeling per route

### 📈 Analytics
- **Websitestatistieken** van dekoninklijkeloop.nl
- KPI-kaarten: bezoekers, sessieduur, bouncepercentage
- Grafiek met bezoekerstrend over tijd
- Populairste pagina's, apparaattypen, verwijzende websites
- Periode-filter: 7 · 30 · 90 dagen
- **CSV export** van alle data

### 👥 Inschrijvingen
- Volledig CRM voor alle aanmeldingen per editie
- Filteren op naam, e-mail, rol, type (account of gast)
- Detailmodal: volledige deelnemersinformatie inclusief noodcontact en waiverstatus
- Bevestigingsmail versturen per deelnemer
- Bulkbewerking mogelijk (o.a. markeren als betaald)

### 💰 Donaties
- Live donatie-widget (GoFundMe-integratie)
- Doelstelling en huidige stand
- Beheerpaneel voor campagne-instellingen per editie

### ✉️ Email
- Twee mailboxen: `info@` en `inschrijving@dekoninklijkeloop.nl`
- Overzicht van ongelezen berichten per mailbox
- E-mails lezen, beantwoorden, archiveren en markeren
- Nieuwe e-mails opstellen
- Automatische verversing elke 60 seconden

### 🖼️ Media
- Galerij van alle foto's (via ImageKit CDN)
- Filteren op map en jaar (2024 / 2025)
- Bestanden uploaden via Cloudinary Upload Widget
- Metadata bewerken: alt-tekst en tags
- Moderatiestatus: pending · approved · rejected · archived

### 📣 Social Media
- Posts aanmaken met tekst, afbeeldingen of video's
- Carousel-posts met meerdere media
- Inplannen voor publicatie
- Overzicht van alle posts per jaar
- Emoji-reacties van bezoekers worden bijgehouden

### 📢 Communicatie (PR-module)
- **Organisatiedatabase:** ziekenhuizen, GGZ, revalidatie, gehandicaptenzorg etc.
- **Contactendatabase:** individuele contactpersonen per organisatie
- **BCC-generator:** kopieer gefilterde e-maillijsten naar klembord
- **Verzendhistorie:** log van alle PR-uitingen

### 👫 Team
- **Notulen & vergaderstukken** — aanmaken, bewerken, opslaan als concept of definitief
- **Evenementprogramma** — chronologisch schema met tijdslots per route
- **Vrijwilligerstaken** — toewijzen aan vrijwilligers, statussen bijhouden (Toegewezen / Bevestigd / Afgerond)

### 📰 Blog *(Administrator only)*
- Blog posts aanmaken en bewerken met rich-text editor (TipTap)
- Statussen: concept · review · gepubliceerd · ingepland · gearchiveerd
- Categorieën en tags
- Reacties modereren

### ⚙️ Instellingen *(Administrator only)*
- Evenementinformatie (naam, datum, locatie, beschikbare afstanden)
- Inschrijvingen openen/sluiten
- E-mailinstellingen en SMTP-configuratie
- **Feedback-tickets** van gebruikers beheren

---

## Deelnemers & Bezoekers

### Inschrijfproces
1. Bezoeker gaat naar `/register`
2. Kiest rol: deelnemer, begeleider of vrijwilliger
3. Vult persoonlijke gegevens, noodcontact en voorkeuren in
4. Accepteert deelnamevoorwaarden en mediabeleid
5. Ontvangt een automatische bevestigingsmail

### Deelnemersdashboard (`/dashboard`)
Na inloggen kunnen deelnemers:
- Eigen inschrijving bekijken
- Profielgegevens aanpassen
- Uitloggen

### Accounttypes
| Type | Omschrijving |
|---|---|
| **Account** | Ingelogde gebruiker met een LaventeCare-account |
| **Gast** | Ingeschreven zonder account (eenmalige registratie) |

---

## Beveiliging

- **Zero-Trust authenticatie:** elke request wordt gevalideerd via de LaventeCare auth-backend
- **RBAC (rolgebaseerde toegangscontrole):** middleware blokkeert ongeautoriseerde toegang op pagina-niveau
- **HttpOnly cookies:** sessietokens zijn niet toegankelijk via JavaScript
- **Content Security Policy (CSP):** strikte headers blokkeren ongewenste scripts en requests
- **Beveiligde headers:** X-Frame-Options, X-Content-Type-Options actief op elke response

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
