# Systeem Instellingen

> ⚠️ **Administrator only** — alleen toegankelijk voor de `admin` rol

## Beschrijving

De instellingenpagina (`/admin/settings`) beheert alle systeemconfiguratie.

---

## Evenementinstellingen

**Component:** `EventSettingsForm.tsx`  
**Convex module:** `eventSettings.ts`

| Veld | Beschrijving |
|---|---|
| Evenementnaam | "De Koninklijke Loop 2026" |
| Datum | Evenementdatum (16 mei 2026) |
| Locatie | Apeldoorn |
| Beschikbare afstanden | Welke routes actief zijn (2.5 / 6 / 10 / 15 km) |
| Inschrijvingen open | Toggle: open of gesloten |

Wanneer inschrijvingen gesloten zijn, toont het registratieformulier een melding. Geen nieuwe aanmeldingen mogelijk.

---

## SMTP Configuratie

**Component:** `MailConfigIsland.tsx` (20KB)

SMTP instellingen voor uitgaande e-mails:

| Veld | Beschrijving |
|---|---|
| SMTP host | Mailserver (bijv. smtp.hostnet.nl) |
| SMTP poort | 587 (TLS) of 465 (SSL) |
| Gebruikersnaam | Authenticatie email |
| Wachtwoord | AES-256-GCM encrypted opgeslagen |
| Admin e-mail (inschrijving) | `inschrijving@dekoninklijkeloop.nl` |
| Admin e-mail (info) | `info@dekoninklijkeloop.nl` |

---

## IMAP Configuratie

**Component:** `IMAPConfigIsland.tsx` (17KB)

IMAP instellingen per mailbox voor de inbox:

| Veld | Beschrijving |
|---|---|
| IMAP host | Mailserver voor inkomende berichten |
| IMAP poort | 993 (SSL) of 143 (STARTTLS) |
| TLS mode | `ssl`, `starttls` of `none` |
| Gebruikersnaam | Mailbox gebruikersnaam |
| Wachtwoord | AES-256-GCM encrypted opgeslagen |

---

## Feedback Tickets

**Component:** `FeedbackList.tsx` en `FeedbackModal.tsx`

Interne feedback-tickets van teamleden:

| Status | Beschrijving |
|---|---|
| `open` | Nieuw ticket, nog niet bekeken |
| `in behandeling` | Admin is ermee bezig |
| `gesloten` | Opgelost |

Nieuwe tickets triggeren een **Telegram notificatie** naar de beheerder.

---

## Telegram Notificaties

**Component:** `TelegramConfigIsland.tsx` (21KB)

Konfigureer Telegram bot voor:
- Nieuwe feedback tickets
- Nieuwe inschrijvingen (optioneel)
- Systeem alerts

---

*← [donations.md](./donations.md) · [Terug naar docs/README.md](../../README.md)*
