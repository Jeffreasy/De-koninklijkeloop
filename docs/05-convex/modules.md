# Convex Modules — Overzicht

Alle 37 Convex modules in `convex/` folder:

---

## Authenticatie & Gebruikers

| Module | Bestand | Doel |
|---|---|---|
| Auth | `auth.ts` | Convex auth integratie |
| Auth Helpers | `authHelpers.ts` | Hulpfuncties voor gebruikersidentiteit |

---

## Inschrijvingen

| Module | Bestand | Doel |
|---|---|---|
| Registratie | `register.ts` | Account-gebaseerde inschrijvingen |
| Gast Registratie | `registerGuest.ts` | Inschrijving zonder account |
| Gast Claim | `claimGuest.ts` | Gast koppelt achteraf account |
| Deelnemer | `participant.ts` | Deelnemersbeheer, profiel, filtering |

---

## Content & Blog

| Module | Bestand | Doel |
|---|---|---|
| Blog | `blog.ts` | Posts, reacties, categorieën (16KB) |
| Archive | `archive.ts` | Archivering van content |

---

## Communicatie & Social

| Module | Bestand | Doel |
|---|---|---|
| Social Posts | `socialPosts.ts` | Social media content (17KB) |
| Social Reacties | `socialReactions.ts` | Emoji reacties op posts |
| PR Communicatie | `prCommunicatie.ts` | Organisaties en contacten (19KB) |
| Contact | `contact.ts` | Contactformulier submissions |

---

## Media

| Module | Bestand | Doel |
|---|---|---|
| Media | `media.ts` | Media items basis |
| Media Metadata | `mediaMetadata.ts` | Extended metadata per foto |
| Migrate Media | `migrateMediaMetadata.ts` | Data migratie script |

---

## Team & Evenement

| Module | Bestand | Doel |
|---|---|---|
| Team | `team.ts` | Notulen en teamleden |
| Admin Taken | `adminTasks.ts` | Vrijwilligerstaken beheer |
| Evenement Instellingen | `eventSettings.ts` | Evenementconfiguratie |
| Seed Evenement | `seedEventSettings.ts` | Testdata voor evenement |

---

## Chat

| Module | Bestand | Doel |
|---|---|---|
| Chat | `chat.ts` | 1-op-1 en groepsgesprekken (15KB) |

---

## Analytics & Telemetry

| Module | Bestand | Doel |
|---|---|---|
| Analytics | `analytics.ts` | Websitestatistieken opslaan |
| Analytics Cleanup | `analyticsCleanup.ts` | GDPR-data retention cleanup |

---

## Donaties

| Module | Bestand | Doel |
|---|---|---|
| Donaties | `donations.ts` | GoFundMe campagne-instellingen |
| Seed Donaties | `seed_donations.ts` | Testdata voor donaties |

---

## Admin & Systeem

| Module | Bestand | Doel |
|---|---|---|
| Admin | `admin.ts` | Admin-level acties |
| Intern | `internal.ts` | Server-side interne functies (11KB) |
| GDPR | `gdpr.ts` | Data export en verwijdering (14KB) |
| Feedback | `feedback.ts` | Feedback tickets systeem |
| Public | `public.ts` | Publiek toegankelijke queries |
| Fix Data | `fixData.ts` | Data reparatie helpers |
| Crons | `crons.ts` | Geplande taken |
| Sync Deelnemers | `syncParticipantCount.ts` | Deelnemersteller sync |

---

## Seed Data (Development Only)

| Module | Bestand | Doel |
|---|---|---|
| Seed Team | `seedTeam.ts` | Testdata teamleden (10KB) |
| Seed PR Data | `seedPrData.ts` | Testdata PR organisaties (31KB) |

---

*← [schema.md](./schema.md) · [Terug naar docs/README.md](../README.md)*
