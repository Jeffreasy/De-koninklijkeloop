# Convex — Overzicht

## Wat is Convex?

**Convex** is de realtime serverless backend van het DKL-platform. Het biedt:
- **Realtime database** — automatische subscriptions zonder WebSocket boilerplate
- **Type-safe API** — TypeScript van client tot server zonder codegen (auto-generated)
- **ACID transacties** — veilige writes per document
- **Serverless functions** — queries, mutations en actions
- **Ingebouwde auth** — gebruikersidentiteit via tokens

---

## Functietype Overzicht

| Type | Beschrijving | Realtime | Side Effects |
|---|---|---|---|
| **Query** | Data ophalen (read-only) | ✅ Live subscription | ❌ |
| **Mutation** | Data wijzigen (write) | Triggert query updates | ❌ |
| **Action** | Externe calls, complex logic | ❌ | ✅ (API calls, email, etc.) |
| **Internal** | Server-side only functies | - | ✅ |

---

## Gebruik in React Islands

```typescript
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';

// Realtime query (automatisch live)
const participants = useQuery(api.participant.getAll, { edition: "2026" });

// Mutation
const updateStatus = useMutation(api.participant.updateStatus);
await updateStatus({ id: participantId, status: "betaald" });
```

---

## Gebruik Server-Side (Astro SSR)

Voor Astro pagina's (niet realtime, maar snelle initial data):

```typescript
// src/lib/convex-server.ts
import { ConvexHttpClient } from "convex/browser";
export const convex = new ConvexHttpClient(import.meta.env.CONVEX_URL);

// In een .astro pagina
const events = await convex.query(api.eventSettings.get);
```

---

## Convex Dashboard

Beheer en debug-omgeving: [dashboard.convex.dev](https://dashboard.convex.dev)

- Data browser (alle tabellen inzien)
- Function logs (elke query/mutation/action)
- Deployment beheer (dev vs productie)
- Cron job monitoring

---

## Cron Jobs

**Bestand:** `convex/crons.ts`

Periodieke taken:
- `syncParticipantCount.ts` — deelnemersteller synchroniseren
- Geplande blog posts checken (aangevuld door Go backend Blog Scheduler)

---

*← [Terug naar docs/README.md](../README.md) · Volgende: [schema.md](./schema.md)*
