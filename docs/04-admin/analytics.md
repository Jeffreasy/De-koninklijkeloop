# Analytics Dashboard

## Beschrijving

De analytics module (`/admin/analytics`) toont websitestatistieken van dekoninklijkeloop.nl.  
**Component:** `AnalyticsDashboard.tsx` (52KB)  
**Convex module:** `analytics.ts`, `analyticsCleanup.ts`

---

## Privacy-First Analytics

De analytics implementatie is **cookieloos en GDPR-compliant**:
- IP-adressen worden **SHA-256 gehasht** — nooit plain text opgeslagen
- Geen tracking cookies
- Data wordt automatisch opgeschoond na 12 maanden (via `analyticsCleanup.ts`)
- Telemetry endpoint: `POST /api/analytics/track` (Go backend)

---

## KPI Kaarten

| Metric | Beschrijving |
|---|---|
| **Unieke bezoekers** | Op basis van gehaste IP |
| **Paginaweergaven** | Totaal per periode |
| **Sessies** | Unieke sessies |
| **Gemiddelde sessieduur** | Seconden per sessie |
| **Bouncepercentage** | % sessies van 1 pagina |

---

## Grafieken

- **Bezoekerstrend over tijd** — lijndiagram per dag/week
- **Populairste pagina's** — top 10 meest bezochte urls
- **Apparaattypen** — desktop / tablet / mobiel verdeling
- **Verwijzende websites** — top referers

---

## Periode Filter

| Periode | Beschrijving |
|---|---|
| Laatste 7 dagen | Kortetermijn trend |
| Laatste 30 dagen | Maandoverzicht |
| Laatste 90 dagen | Kwartaaloverzicht |

---

## Data Export

CSV export van alle analytics data beschikbaar via de toolbar.

---

## Web Vitals

`src/lib/webVitals.ts` meet en rapporteert Core Web Vitals (CWV) in realtime:
- LCP, CLS, INP, TTFB
- Verstuurd naar analytics backend

---

*← [chat.md](./chat.md) · Volgende: [donations.md](./donations.md)*
