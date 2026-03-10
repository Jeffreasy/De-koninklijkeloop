# Team Hub

## Beschrijving

De Team Hub (`/admin/team`) centraliseert de interne organisatie van het DKL-team.  
**Convex module:** `team.ts`, `adminTasks.ts`

---

## Notulen & Vergaderstukken

**Component:** `TeamHub.tsx`

- Aanmaken, bewerken en opslaan als concept of definitief
- Historizatie van alle notulen
- Zichtbaar voor alle admins en editors

---

## Evenementprogramma

**Component:** `EventSchedule.tsx` (26KB)

Chronologisch dagschema voor de evenementsdag (16 mei 2026):
- Tijdslots (bijv. 08:00 - Registratie, 09:30 - Opening, etc.)
- Koppeling aan route (2.5 / 6 / 10 / 15 km start)
- Locatie per activiteit
- Beschrijving en notities per tijdslot

Het evenementprogramma is ook zichtbaar op de **publieke pagina** `/programma`.

---

## Vrijwilligerstaken

**Component:** `VolunteerTasksManager.tsx` (31KB)

- Taken aanmaken met beschrijving, locatie en benodigde vrijwilligers
- Toewijzen aan specifieke vrijwilligers (uit de deelnemerslijst)
- Status bijhouden:

| Status | Beschrijving |
|---|---|
| `toegewezen` | Taak toegewezen, nog niet bevestigd |
| `bevestigd` | Vrijwilliger heeft bevestigd |
| `afgerond` | Taak voltooid |

---

## Evenementinstellingen

**Component:** `EventSettingsForm.tsx` (18KB)  
**Route:** `/admin/settings`

Configuratie die het volledige platform beïnvloedt:
- Evenementnaam en datum
- Locatie
- Beschikbare afstanden (welke routes actief zijn)
- Inschrijvingen open/gesloten toggle

---

*← [pr-communication.md](./pr-communication.md) · Volgende: [chat.md](./chat.md)*
