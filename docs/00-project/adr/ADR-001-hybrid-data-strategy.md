# ADR-001 — Hybrid Data Strategy: Convex + Go

**Status:** Geaccepteerd  
**Datum:** November 2025  
**Auteur:** Jeffrey (Technisch Beheerder DKL)

---

## Context

Het DKL-platform heeft twee fundamenteel verschillende databehoeften:

1. **Realtime UI-data** — inschrijvingen, chat, social posts, media metadata, blog content — die direct in de browser zichtbaar moet zijn en instant moet updaten.
2. **Infrastructuur-kritieke data** — authenticatie, multi-tenancy, SMTP credentials, email logs, GDPR compliance — die transactioneel veilig, auditabel en buiten de frontend-toegang moet liggen.

---

## Beslissing

We gebruiken **twee databronnen naast elkaar** met strikte verantwoordelijkheidsverdeling:

### Convex — Realtime domeindata
Convex wordt gebruikt voor alle applicatiedata die realtime gedrag vereist:
- Inschrijvingen en deelnemersbeheer
- Chat berichten en groepen
- Blog posts, reacties, categorieën
- Social media posts en planning
- Media metadata en moderatiestatus
- PR organisaties en contacten
- Donatie-instellingen
- Team notulen en vrijwilligerstaken
- Evenementinstellingen en programma

**Waarom Convex?**
- Ingebouwde realtime subscriptions (geen WebSocket boilerplate)
- Type-veilige queries/mutations via TypeScript
- Automatische optimistic updates voor snelle UI
- Serversless — geen infra te beheren
- ACID-transacties per document

### LaventeCare Go Backend — Infrastructuur
De Go backend beheert alles wat direct op de server-infra draait:
- IAM: gebruikers, tenants, RBAC, login/logout
- JWT generatie (RS256) en validatie
- Multi-Tenant SMTP email delivery
- IMAP inbox polling en management
- Background workers (6 processen: Email, IMAP, Janitor, Social, Analytics, Blog Scheduler)
- GDPR data retention en purging
- Analytics telemetry ingestion (cookieloos, GDPR-compliant)
- Sentry error monitoring

**Waarom aparte Go backend?**
- HttpOnly cookie management vereist echte server (geen Convex)
- SMTP credentials moeten AES-GCM encrypted in PostgreSQL staan
- Database Row Level Security (RLS) voor multi-tenant isolatie
- Background workers vereisen persistent server process
- PostgreSQL ACID transacties voor kritieke infra-data

---

## Consequenties

### Positief
- Realtime UI is volledig via Convex — zero boilerplate
- Auth en secrets zijn volledig geïsoleerd in de Go backend
- Beide systemen zijn onafhankelijk schaalbaar
- Convex kan worden vervangen zonder de auth-infra aan te raken

### Negatief / Trade-offs
- Developers moeten twee systemen begrijpen
- Data over twee systemen vereist applicatielaag integratie (bijv. `src/lib/api.ts` + `src/lib/convex-server.ts`)
- Lokale dev vereist zowel `convex dev` als `docker compose up`

---

## Patroon in de codebase

```
src/lib/
  api.ts          → HTTP calls naar Go backend (auth, email, etc.)
  convex-server.ts → Server-side Convex client (SSR data fetching)
  
convex/           → Alle Convex mutations, queries & actions
Backenddocs/      → Volledige Go backend API documentatie
```

---

*← [Terug naar 00-project](../overview.md) · [Terug naar docs/README.md](../../README.md)*
