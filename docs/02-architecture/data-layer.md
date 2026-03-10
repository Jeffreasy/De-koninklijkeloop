# Data Laag — Convex & Hybrid Go Pattern

## Overzicht

Het DKL platform gebruikt een **hybride datastrategie**:

| Systeem | Type Data | Reden |
|---|---|---|
| **Convex** | Applicatie- en domeindata | Realtime subscriptions, type-safe, serverless |
| **PostgreSQL (Go)** | Infrastructuurdata | Transactioneel, RLS, secrets, compliance |

→ Zie ook [ADR-001 Hybrid Data Strategy](../00-project/adr/ADR-001-hybrid-data-strategy.md)

---

## Convex Data Layer

### Modules Overzicht

| Module | Bestand | Doel |
|---|---|---|
| Registraties | `register.ts`, `registerGuest.ts` | Deelnemer aanmeldingen |
| Deelnemers | `participant.ts` | Deelnemersbeheer en profielen |
| Team | `team.ts`, `seedTeam.ts` | Teamleden en rolverdeling |
| Blog | `blog.ts` | Posts, reacties, categorieën |
| Chat | `chat.ts` | 1-op-1 en groepsgesprekken |
| Social | `socialPosts.ts`, `socialReactions.ts` | Social media content |
| PR Communicatie | `prCommunicatie.ts` | Organisaties en contacten |
| Media | `media.ts`, `mediaMetadata.ts` | Foto's en video metadata |
| Donaties | `donations.ts` | Campagne-instellingen |
| Analytics | `analytics.ts` | Websitestatistieken |
| Evenement | `eventSettings.ts` | Evenementconfiguratie |
| Admin | `admin.ts`, `adminTasks.ts` | Adminacties en vrijwilligerstaken |
| GDPR | `gdpr.ts` | Data export en verwijdering |
| Contact | `contact.ts` | Contactformulier submissions |
| Auth helpers | `authHelpers.ts`, `auth.ts` | Convex auth integratie |
| Intern | `internal.ts` | Interne server-side acties |

### Queries & Mutations Patroon

```typescript
// Query: data ophalen (readonly, realtime subscription)
export const getParticipants = query({
  args: { edition: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db.query("participants")
      .filter(q => q.eq(q.field("edition"), args.edition))
      .collect();
  }
});

// Mutation: data wijzigen (transactioneel)
export const updateParticipantStatus = mutation({
  args: { id: v.id("participants"), status: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { status: args.status });
  }
});

// Action: externe calls (email, API calls)
export const sendConfirmationEmail = action({
  args: { participantId: v.id("participants") },
  handler: async (ctx, args) => {
    // Calls naar Go backend /api/email/send
  }
});
```

### Gebruik in React Islands

```typescript
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';

// Realtime data
const participants = useQuery(api.participant.getAll, { edition: "2026" });

// Mutation uitvoeren
const updateStatus = useMutation(api.participant.updateStatus);
```

---

## PostgreSQL / Go Backend Data

De Go backend beheert de volgende tabellen:
- `users` — accounts, wachtwoorden (gehasht), MFA secrets
- `tenants` — multi-tenant configuratie
- `roles` — RBAC role assignments
- `email_logs` — audit trail alle verzonden e-mails
- `smtp_configs` — AES-256 encrypted SMTP credentials per tenant
- `imap_configs` — IMAP instellingen per mailbox
- `sessions` — refresh token beheer
- `blog_*` — Blog scheduler data (systeemniveau)
- `analytics_events` — GDPR-compliant telemetry (partitioned by month)

→ Zie [Backenddocs/01 Architecture & Security](../../Backenddocs/01_architecture_security.md) voor het volledige schema.

---

## Server-side Convex (SSR)

Voor SSR Astro pagina's wordt Convex server-side aangeroepen:

```typescript
// src/lib/convex-server.ts
import { ConvexHttpClient } from "convex/browser";
export const convexServer = new ConvexHttpClient(import.meta.env.CONVEX_URL);
```

Dit geeft Astro `.astro` pagina's directe (non-realtime) toegang tot Convex data voor initial page render.

---

*← [frontend-architecture.md](./frontend-architecture.md) · Volgende: [security-model.md](./security-model.md)*
