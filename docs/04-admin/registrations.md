# Inschrijvingen & CRM

## Beschrijving

Het inschrijvingenbeheer (`/admin/deelnemers`) is het volledige CRM-systeem voor alle aanmeldingen.  
**Convex tabel:** `registrations`

---

## Deelnemerstabel

**Component:** `ParticipantsTable.tsx` (76KB)

### Filter & Zoek Opties

| Filter | Opties |
|---|---|
| Editie | 2025 / 2026 |
| Rol | Alle / Deelnemer / Begeleider / Vrijwilliger |
| Type | Account / Gast |
| Status | Pending / Paid / Cancelled |
| Zoeken | Naam, e-mail |

### Kolommen

- Naam (één veld: `name`)
- E-mailadres
- Rol
- Afstand (deelnemers)
- Editie
- Type (`authenticated` of `guest`)
- Status (`pending` / `paid` / `cancelled`)
- Bevestiging verstuurd (datum + door wie)
- Acties (open detail, bevestigen, bewerken)

---

## Deelnemer Detailmodal

**Component:** `ParticipantDetailModal.tsx` (34KB)

Bevat de volledige deelnemersinformatie uit het `registrations` schema:
- Naam (`name`)
- E-mailadres
- Rol en afstand
- Woonplaats (`city`)
- Pendelbusoorkeur (`shuttleBus`: `pendelbus` of `eigen-vervoer`)
- Rolstoelgebruik (`wheelchairUser`)
- Woont in zorginstelling (`livesInFacility`)
- Type deelnemer (`participantType`: doelgroep / verwant / anders)
- Support nodig (`supportNeeded`)
- Noodcontact naam (`iceName`) + telefoonnummer (`icePhone`)
- Waiver akkoord (`agreedToTerms`)
- Mediabeleid akkoord (`agreedToMedia`)
- Registratietype (`userType`: authenticated of guest)
- Inschrijving editie
- Admin notities (`notes`)

### Acties vanuit detailmodal
- ✉️ Bevestigingsmail versturen
- ✏️ Gegevens bewerken
- 🔄 Status wijzigen (pending / paid / cancelled)

---

## Bulkbewerking

**Component:** `BulkEditModal.tsx` (14KB)

Selecteer meerdere deelnemers voor bulk:
- Status wijzigen
- Editie wijzigen (2025 ↔ 2026)
- Bevestigingsmail sturen naar selectie

---

## Bevestigingsmail

De bevestigingsmail werkt via:
1. Admin klikt "Bevestiging versturen" in detailmodal
2. POST naar `/api/send-confirmation` (Astro API route — 22KB logica)
3. Go backend SMTP delivery naar deelnemer e-mailadres
4. `confirmationSentAt` en `confirmationSentBy` worden opgeslagen in Convex

Afzender: `inschrijving@dekoninklijkeloop.nl`

---

## Gast vs Account

| Type | Kenmerk (`userType`) | Dashboard toegang |
|---|---|---|
| **Gast** | `guest` | ❌ Geen |
| **Account** | `authenticated` | ✅ `/dashboard` |

Gasten kunnen achteraf een account aanmaken en hun inschrijving claimen via `convex/claimGuest.ts`.

---

*← [dashboard.md](./dashboard.md) · Volgende: [media.md](./media.md)*
