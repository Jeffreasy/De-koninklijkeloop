# Dashboard Beheer

## Beschrijving

Het admin dashboard (`/admin/dashboard`) is het centrale overzichtspaneel voor Administrators en Editors. Het toont realtime inschrijvingsdata via Convex subscriptions.

---

## KPI Kaarten

| Kaart | Data | Update |
|---|---|---|
| **Totaal Deelnemers** | Aanmeldingen actueel editie | Realtime |
| **Nieuw vandaag** | Inschrijvingen afgelopen 24u | Realtime |
| **Rolverdeling** | Deelnemer / Begeleider / Vrijwilliger | Realtime |
| **Revenue** | Schatting op basis van betaalde inschrijvingen | Realtime |

---

## Live Inschrijvingstabel

**Component:** `DashboardTable.tsx`

Functies:
- Filter op editie (2025 / 2026)
- Filter op rol (alle / deelnemer / begeleider / vrijwilliger)
- Zoeken op naam of e-mail
- Klikbaar naar deelnemer detailmodal
- Live updates via Convex subscription

---

## Activiteitsfeed

Toont de meest recente aanmeldingen in chronologische volgorde met:
- Naam deelnemer
- Rol en afstand
- Tijdstip van aanmelding
- Editie badge (2025/2026)

---

## Afstand Populariteit

Grafiek die de verdeling van gekozen afstanden toont:
- 2.5 km
- 6 km
- 10 km
- 15 km

---

## Systeemstatus Widget

Onderin het dashboard: real-time health status van:
- LaventeCare Auth backend
- Convex database
- ImageKit CDN
- Go API

**Component:** `src/components/islands/SystemStatus.tsx`

---

## Toegang

| Rol | Toegang |
|---|---|
| Administrator | ✅ Volledig |
| Editor | ✅ Volledig |
| Deelnemer | ❌ Geen toegang |

---

*← [Terug naar docs/README.md](../../README.md) · Gerelateerd: [registrations.md](./registrations.md)*
