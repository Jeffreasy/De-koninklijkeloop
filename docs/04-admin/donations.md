# Donaties Beheer

## Beschrijving

De donatiemodule beheert de GoFundMe-integratie via twee aparte Convex tabellen.  
**Route:** `/admin/donaties`

---

## Convex Tabellen

| Tabel | Doel |
|---|---|
| `donation_campaigns` | GoFundMe widget configuratie per jaar |
| `donations` | Individuele donatiepayment records (toekomst/Mollie/Stripe) |

---

## GoFundMe Widget

**Component:** `DonationWidgetIsland.tsx` (10KB)

Live donatie-widget zichtbaar op:
- Publieke pagina `/charity`
- Admin dashboard

De widget laadt de actieve campagne (`is_active: true`) uit `donation_campaigns` en toont de GoFundMe embed via `gofundme_url`.

---

## Campagne Instellingen

**Component:** `DonationSettingsIsland.tsx` (13KB)  
**Convex tabel:** `donation_campaigns`

Bewerkbaar per jaar (2025 / 2026):

| Veld | Type | Beschrijving |
|---|---|---|
| `year` | string | "2025" of "2026" |
| `title` | string | Campagnetitel (bijv. "Samen in Actie 2026") |
| `description` | string (optioneel) | Contexttekst |
| `gofundme_url` | string | Volledige GoFundMe widget URL |
| `is_active` | boolean | Slechts één campagne tegelijk actief |
| `target_amount` | number (optioneel) | Streefbedrag |
| `current_amount` | number (optioneel) | Bijgehouden huidig bedrag |

---

## `donations` Tabel (Betaalrecords)

De `donations` tabel is bedoeld voor het bijhouden van individuele donaties met betaalstatus:

| Veld | Type | Beschrijving |
|---|---|---|
| `donorName` | string | Naam donateur |
| `donorEmail` | string | E-mail donateur |
| `amount` | number | Bedrag in centen (bijv. 2500 = €25) |
| `currency` | string | "EUR" |
| `paymentMethod` | enum | ideal / creditcard / bancontact / paypal / other |
| `paymentProvider` | string | "Mollie", "Stripe" etc. |
| `status` | `pending \| completed \| failed \| refunded` | Betaalstatus |
| `isAnonymous` | boolean | Anonieme donatie |

---

*← [analytics.md](./analytics.md) · Volgende: [settings.md](./settings.md)*
