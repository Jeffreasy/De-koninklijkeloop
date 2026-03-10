# Email Beheer

## Beschrijving

Het emailbeheer (`/admin/email`) beheert twee DKL mailboxen via IMAP.

---

## Mailboxen

| Mailbox | Doel |
|---|---|
| `info@dekoninklijkeloop.nl` | Algemene vragen, contact |
| `inschrijving@dekoninklijkeloop.nl` | Inschrijvingsbevestigingen en vragen |

---

## Functies

### Inbox Weergave

**Component:** `EmailManagerIsland.tsx` (28KB)

- Inbox en archief weergave per mailbox
- Automatische verversing elke **60 seconden**
- Ongelezen teller per mailbox

**Component:** `EmailListItem.tsx`  
Toont per email: afzender, onderwerp, datum, gelezen/ongelezen status

### Email Lezen

**Component:** `EmailDetailPanel.tsx` (12KB)

- Volledige e-mailweergave (tekst en HTML)
- Markeren als gelezen / ongelezen
- Archiveren

### Beantwoorden

**Component:** `ComposeModal.tsx` (25KB)

- Reply op ontvangen mail
- Nieuwe email opstellen
- Ontvanger zoeken via `ContactPicker.tsx`
- Versturen via Go backend SMTP worker

### Nieuwe Email Opstellen

Via de Compose-knop:
1. Kies afzender mailbox (info of inschrijving)
2. Voeg ontvangers toe (ContactPicker of handmatig)
3. Schrijf onderwerp en bericht
4. Versturen → Go SMTP worker

---

## SMTP/IMAP Configuratie

**Beheerd via:** `MailConfigIsland.tsx` en `IMAPConfigIsland.tsx`  
**Route:** `/admin/settings`

- SMTP credentials opgeslagen als **AES-256-GCM encrypted** blobs
- IMAP polling interval configureerbaar
- TLS mode configureerbaar per mailbox (`imap_tls_mode`)

---

## Email Audit Trail

Alle verzonden e-mails worden gelogd in `email_logs` (PostgreSQL):

| Veld | Beschrijving |
|---|---|
| `recipient_email` | Ontvanger (plain) |
| `recipient_hash` | SHA-256 hash ontvanger (GDPR) |
| `subject` | Onderwerp |
| `sent_at` | Verzendtijdstip |
| `sent_by` | Admin user ID |

---

*← [media.md](./media.md) · Volgende: [social-media.md](./social-media.md)*
