# Deployment — Productie Stack Overzicht

## Componenten

| Component | Platform | URL |
|---|---|---|
| **Frontend** | Vercel | dekoninklijkeloop.nl |
| **Realtime Data** | Convex Cloud | *.convex.cloud |
| **Go Backend (IAM)** | Render.com | api.dekoninklijkeloop.nl |
| **PostgreSQL** | Render.com (Managed DB) | intern |
| **Redis** | Render.com (Key-Value) | intern |
| **Media CDN** | ImageKit | ik.imagekit.io |
| **Video** | Streamable | streamable.com |

---

## Deployment Workflows

### Frontend (Vercel)

Elke push naar `main` branch triggert een automatische Vercel deployment.

**Manueel deployen:**
```bash
vercel --prod
```

### Convex

Convex wordt automatisch gedeployed via CI of handmatig:
```bash
npx convex deploy
```

### Go Backend (Render.com)

De Go backend wordt gedeployed via een Docker image naar Render.com.  
→ Zie [Backenddocs/03 Operations Runbook](../../Backenddocs/03_operations_runbook.md) voor de volledige procedure.

---

## Branches & Environments

| Branch | Environment | URL |
|---|---|---|
| `main` | Productie | dekoninklijkeloop.nl |
| `develop` | Preview | *.vercel.app preview URL |

---

## Environment Variables

Productie-omgevingsvariabelen worden beheerd via:
- **Vercel Dashboard** — frontend variabelen
- **Render.com Dashboard** — backend variabelen
- **Convex Dashboard** — Convex deployment key

→ Zie [environment-variables.md](../01-getting-started/environment-variables.md) voor de volledige lijst.

---

*← [Terug naar docs/README.md](../README.md) · Volgende: [vercel.md](./vercel.md)*
