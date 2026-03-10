# Convex Schema — Tabelstructuur

> Gebaseerd op `convex/schema.ts` (641 regels) — de **exacte** veldnamen zoals in de code.

---

## `registrations` — Inschrijvingen (Hoofd CRM tabel)

| Veld | Type | Beschrijving |
|---|---|---|
| `name` | string | Volledige naam deelnemer |
| `email` | string | E-mailadres |
| `role` | `deelnemer \| begeleider \| vrijwilliger` | Rol bij het evenement |
| `distance` | `2.5 \| 6 \| 10 \| 15` (optioneel) | Gekozen afstand (alleen deelnemers) |
| `supportNeeded` | `ja \| nee \| anders` (optioneel) | Begeleiding nodig |
| `supportDescription` | string (optioneel) | Beschrijving ondersteuningsbehoefte |
| `city` | string (optioneel) | Woonplaats |
| `wheelchairUser` | boolean (optioneel) | Rolstoelgebruik |
| `shuttleBus` | `pendelbus \| eigen-vervoer` (optioneel) | Vervoervoorkeur |
| `livesInFacility` | boolean (optioneel) | Woont in zorginstelling |
| `participantType` | `doelgroep \| verwant \| anders` (optioneel) | Type deelnemer |
| `iceName` | string | Noodcontact naam (ICE) |
| `icePhone` | string | Noodcontact telefoonnummer (ICE) |
| `agreedToTerms` | boolean | Akkoord deelnamevoorwaarden |
| `agreedToMedia` | boolean | Akkoord mediabeleid |
| `userType` | `authenticated \| guest` (optioneel) | Account of gast |
| `authUserId` | string (optioneel) | LaventeCare User ID (alleen accounts) |
| `companionName` | string (optioneel) | Naam van begeleide persoon |
| `companionEmail` | string (optioneel) | Email van begeleide persoon |
| `notes` | string (optioneel) | Admin aantekeningen |
| `status` | `pending \| paid \| cancelled` | Betalingsstatus |
| `edition` | string (optioneel) | Editie: "2025" of "2026" |
| `confirmationSentAt` | number (optioneel) | Unix timestamp bevestigingsmail |
| `confirmationSentBy` | string (optioneel) | E-mail admin die bevestiging stuurde |

> **Let op:** Er is geen `tshirtSize` of `firstName`/`lastName` in het schema — de naam is één `name` veld.

---

## `media_metadata` — Foto Metadata

| Veld | Type | Beschrijving |
|---|---|---|
| `cloudinary_public_id` | string | ImageKit filePath (legacy naam) |
| `alt_text` | string | Alt tekst voor accessibiliteit |
| `title` | string (optioneel) | Titel/onderschrift |
| `folder` | string (optioneel) | ImageKit map (bijv. `"De Koninklijkeloop/DKLFoto's 2024"`) |
| `tags` | string[] (optioneel) | Tags |
| `updated_by` | string | Admin e-mail |
| `updated_at` | number | Laatste update timestamp |

---

## `social_posts` — Social Media Posts

| Veld | Type | Beschrijving |
|---|---|---|
| `year` | string | "2024", "2025", "2026" |
| `imageUrl` | string | Afbeelding URL (of thumbnail voor video) |
| `caption` | string | Post tekst/beschrijving |
| `instagramUrl` | string | Link naar originele Instagram post |
| `isFeatured` | boolean | Uitgelichte post |
| `isVisible` | boolean | Zichtbaar op website |
| `mediaType` | `image \| video` (optioneel) | Media type |
| `videoUrl` | string (optioneel) | Streamable URL |
| `mediaItems` | array (optioneel) | Carousel items |
| `postedDate` | string/number (optioneel) | Publicatiedatum |

> **Let op:** Social posts gebruiken `isVisible` (boolean), niet een `status` enum.

---

## Chat Tabellen

De chat bestaat uit **vier** aparte tabellen:

### `direct_messages` — 1-op-1 Berichten
| Veld | Type | Beschrijving |
|---|---|---|
| `sender` | string | Afzender identifier |
| `recipient` | string | Ontvanger identifier |
| `content` | string | Berichttekst |
| `isRead` | boolean | Leesbevestiging |
| `type` | `text \| image \| system` | Berichttype |
| `conversationId` | string (optioneel) | Deterministic conversation key |
| `reactions` | array (optioneel) | Emoji reacties |
| `createdAt` | number | Tijdstip |

### `group_conversations` — Groepsgesprekken
| Veld | Type | Beschrijving |
|---|---|---|
| `name` | string | Groepsnaam |
| `members` | string[] | Array van user e-mails |
| `createdBy` | string | Maker |
| `avatarEmoji` | string (optioneel) | Groep emoji |
| `lastMessageAt` | number (optioneel) | Laatste berichttijdstip |

### `group_messages` — Groepsberichten
| Veld | Type | Beschrijving |
|---|---|---|
| `groupId` | ID → `group_conversations` | Groep referentie |
| `sender` | string | Afzender |
| `senderName` | string | Weergavenaam afzender |
| `content` | string | Berichttekst |
| `type` | `text \| image \| system` | Berichttype |
| `reactions` | array (optioneel) | Emoji reacties |

### `presence` — Online Aanwezigheid
| Veld | Type | Beschrijving |
|---|---|---|
| `user` | string | User identifier |
| `name` | string | Weergavenaam |
| `lastActive` | number | Laatste heartbeat |
| `status` | `online \| offline` | Status |
| `role` | `admin \| editor` (optioneel) | Gebruikersrol |
| `typingTo` | string (optioneel) | Wie de gebruiker typt aan |

---

## `team_minutes` — Notulen

| Veld | Type | Beschrijving |
|---|---|---|
| `title` | string | Titel vergadering |
| `date` | string | ISO datum "2026-01-19" |
| `type` | `meeting \| agenda \| other` | Type document |
| `status` | `concept \| final` | Status |
| `tags` | string[] | Tags |
| `content` | string | Markdown inhoud |

---

## `event_schedule` — Evenementprogramma

| Veld | Type | Beschrijving |
|---|---|---|
| `time` | string | Tijdstip "10:15" |
| `title` | string | Activiteitsnaam |
| `description` | string | Beschrijving |
| `type` | `logistics \| event \| break` | Type |
| `icon` | string | Pictogramsleutel |
| `routeId` | string (optioneel) | Gekoppelde route |
| `order` | number | Sorteervolgorde |

---

## `event_settings` — Evenementconfiguratie

| Veld | Type | Beschrijving |
|---|---|---|
| `is_active` | boolean | Singleton vlag |
| `name` | string | Evenementnaam |
| `event_date` | string | ISO datum "2026-05-16" |
| `event_date_display` | string | "zaterdag 16 mei 2026" |
| `registration_open` | boolean | Inschrijvingen open/gesloten |
| `location_name` | string | Locatienaam |
| `location_city` | string | Stad |
| `start_location` | string | Startpunt |
| `finish_location` | string | Finishpunt |
| `available_distances` | array | Beschikbare afstanden (km + label) |
| `send_confirmation_emails` | boolean | Automatische bevestigingsmail |

---

## `donation_campaigns` — GoFundMe Campagnes

| Veld | Type | Beschrijving |
|---|---|---|
| `year` | string | "2025" of "2026" |
| `title` | string | Campagnetitel |
| `description` | string (optioneel) | Contexttekst |
| `gofundme_url` | string | Volledige widget URL |
| `is_active` | boolean | Actieve campagne |
| `target_amount` | number (optioneel) | Streefbedrag |
| `current_amount` | number (optioneel) | Huidig bedrag |

> **Let op:** `donations` tabel slaat individuele donaties op (met betaalmethode, provider, status). `donation_campaigns` beheert de GoFundMe widget-configuratie per jaar.

---

## `blog_posts` — Blog Artikelen

| Veld | Type | Beschrijving |
|---|---|---|
| `title` | string | Blogtitel |
| `slug` | string | URL-slug |
| `content` | string | HTML van TipTap editor |
| `excerpt` | string (optioneel) | Samenvatting |
| `cover_image_url` | string (optioneel) | Hoofdafbeelding |
| `status` | `draft \| review \| published \| scheduled \| archived` | Status |
| `is_featured` | boolean | Uitgelicht |
| `tags` | string[] (optioneel) | Tags |
| `seo_title` | string (optioneel) | SEO titel |
| `seo_description` | string (optioneel) | SEO beschrijving |
| `published_at` | number (optioneel) | Publicatiemoment |

---

## `blog_comments` — Blog Reacties

| Veld | Type | Beschrijving |
|---|---|---|
| `post_id` | ID → `blog_posts` | Post referentie |
| `author_name` | string | Naam reageerder |
| `content` | string | Reactietekst |
| `status` | `pending \| approved \| rejected` | Moderatiestatus |
| `parent_id` | ID (optioneel) | Reply threading |

---

## `pr_organizations` — PR Organisaties

| Veld | Type | Beschrijving |
|---|---|---|
| `naam` | string | Organisatienaam |
| `sector` | enum | academisch_ziekenhuis / algemeen_ziekenhuis / ggz / gehandicaptenzorg / verpleging_verzorging / revalidatie / overig |
| `regio` | enum | apeldoorn / gelderland / overijssel / overig |
| `isActive` | boolean | Actief in de database |

## `pr_contacts` — PR Contactpersonen

| Veld | Type | Beschrijving |
|---|---|---|
| `email` | string | E-mailadres |
| `naam` | string (optioneel) | Naam |
| `functie` | string (optioneel) | Functietitel |
| `organizationId` | ID (optioneel) | Gekoppelde organisatie |
| `isActive` | boolean | Actief contact |

---

## `analytics_events` — Analytics

| Veld | Type | Beschrijving |
|---|---|---|
| `event` | string | Event naam |
| `path` | string | Pagina URL |
| `sessionId` | string | Sessie identifier |
| `metadata` | any (optioneel) | Extra data |
| `timestamp` | number | Tijdstip |

---

## `feedback` — Feedback Tickets

| Veld | Type | Beschrijving |
|---|---|---|
| `type` | string | "bug" / "feature" / "praise" / "other" |
| `message` | string | Feedbacktekst |
| `status` | `open \| in_progress \| closed \| rejected` | Afhandelingsstatus |
| `adminNotes` | string (optioneel) | Admin notities |
| `userId` | string (optioneel) | User identifier |

---

## `volunteer_tasks` — Vrijwilligerstaken

| Veld | Type | Beschrijving |
|---|---|---|
| `registrationId` | ID → `registrations` | Gekoppelde inschrijving |
| `title` | string | Taakomschrijving |
| `description` | string (optioneel) | Details |
| `location` | string (optioneel) | Locatie |
| `startTime` | string (optioneel) | Starttijd |
| `endTime` | string (optioneel) | Eindtijd |
| `status` | `assigned \| confirmed \| completed` | Status |
| `assignedBy` | string (optioneel) | Editor die taak toewees |

---

*← [overview.md](./overview.md) · Volgende: [modules.md](./modules.md)*
