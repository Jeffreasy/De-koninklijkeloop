# Convex Setup — De Koninklijkeloop

## Vereisten

Je hebt een [Convex](https://convex.dev) account nodig. Het project heet **`frugal-goose-15`**.

## Eerste keer instellen

De interactieve Convex setup (login + projectselectie) moet handmatig uitgevoerd worden:

```bash
npx convex dev
```

**Stap voor stap:**

1. Er opent een browservenster → log in met je Convex account.
2. Kies **"Existing Project"** → selecteer **`frugal-goose-15`**.
3. Convex genereert de map `convex/_generated/` en synchroniseert het schema.
4. Je terminal toont `✓ Ready` als alles werkt.

> Laat dit terminal venster open staan tijdens het ontwikkelen — Convex houdt automatisch je schema en functies gesynchroniseerd.

## .env.local instellen

Kopieer het voorbeeld-bestand en vul de waarden in:

```bash
cp .env .env.local
```

Verplichte variabelen:

```env
# Convex
PUBLIC_CONVEX_URL=https://<jouw-deployment>.convex.cloud

# LaventeCare Auth Backend
PUBLIC_API_URL=https://laventecareauthsystems.onrender.com/api/v1
PUBLIC_TENANT_ID=b2727666-7230-4689-b58b-ceab8c2898d5

# ImageKit CDN
IMAGEKIT_PRIVATE_KEY=<private_key>
PUBLIC_IMAGEKIT_PUBLIC_KEY=<public_key>
PUBLIC_IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/a0oim4e3e
```

## Database Schema

Het schema bevindt zich in `convex/schema.ts` en bevat **27 tabellen**. De belangrijkste zijn:

| Tabel | Functie |
|---|---|
| `registrations` | Inschrijvingen (kern-CRM) |
| `event_settings` | Singleton evenementconfiguratie |
| `blog_posts` | Blog artikelen |
| `social_posts` | Social media posts |
| `media` | Foto's (ImageKit) en video's (Streamable) |
| `media_metadata` | ImageKit alt-tekst en tags |
| `donation_campaigns` | GoFundMe campagnes |
| `pr_organizations` / `pr_contacts` | PR-database |
| `team_minutes` / `event_schedule` | Team hub |
| `direct_messages` / `group_messages` | Interne chat |
| `presence` | Realtime aanwezigheid |
| `analytics_events` | Custom event tracking |
| `feedback` | Intern ticketsysteem |

Zie `convex/schema.ts` voor het volledige schema met alle velden en indexen.

## Convex Functions per module

| Bestand | Module |
|---|---|
| `convex/register.ts` | Inschrijving (authenticated) |
| `convex/registerGuest.ts` | Gastinschrijving |
| `convex/claimGuest.ts` | Gast → Account upgrade |
| `convex/admin.ts` | Admin queries/mutations |
| `convex/blog.ts` | Blog CRUD |
| `convex/socialPosts.ts` | Social media |
| `convex/socialReactions.ts` | Emoji reacties |
| `convex/donations.ts` | Donaties |
| `convex/eventSettings.ts` | Evenementinstellingen |
| `convex/media.ts` | Media management |
| `convex/mediaMetadata.ts` | ImageKit metadata |
| `convex/prCommunicatie.ts` | PR module |
| `convex/team.ts` | Notulen + schema |
| `convex/chat.ts` | Direct + groepschat |
| `convex/analytics.ts` | Analytics events |
| `convex/gdpr.ts` | GDPR/AVG verzoeken |
| `convex/feedback.ts` | Feedback ticketsysteem |
| `convex/internal.ts` | Interne server functies |
| `convex/authHelpers.ts` | Token verificatie |

## Seeding (optioneel)

Er zijn seed scripts beschikbaar voor initiële data:

```bash
# Event instellingen aanmaken
npx convex run seedEventSettings:seedEventSettings

# PR organisaties en contacten laden (~250 records)
npx convex run seedPrData:seedOrganizations
npx convex run seedPrData:seedContacts

# Team data laden
npx convex run seedTeam:seedTeam

# Test donaties aanmaken
npx convex run seed_donations:seedDonations
```

## Productie

Op Vercel wordt de `PUBLIC_CONVEX_URL` ingesteld als environment variable in het Vercel dashboard. De deployment sync loopt via de Convex cloud dashboard.

---

*De Koninklijke Loop · Convex project: `frugal-goose-15`*
