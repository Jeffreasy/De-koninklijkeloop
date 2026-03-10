# Backend — LaventeCare Go

De volledige technische documentatie van de LaventeCare Go backend staat in de **`/Backenddocs/`** folder.

---

## Quick Links

| Document | Inhoud |
|---|---|
| [01 — Architecture & Security](../../Backenddocs/01_architecture_security.md) | IAM, 5 Laws of Defense, PostgreSQL schema, RBAC hiërarchie, JWT/MFA tokens, 6 Background Worker sub-processen |
| [02 — API & Frontend Integration](../../Backenddocs/02_api_integration.md) | Protocol standaarden, headers, alle API endpoints per RBAC niveau (Public / Viewer / User / Editor / Admin), MFA flow |
| [03 — Operations & Deployment Runbook](../../Backenddocs/03_operations_runbook.md) | Docker → Render.com deployment, alle environment variables, Background Workers, Multi-Tenant Email Gateway, Disaster Recovery |
| [04 — Development & Testing](../../Backenddocs/04_development_testing.md) | Lokale `docker compose` setup, sqlc query structuur, scripts directory, test procedures (Unit, Integration, RBAC, Worker) |
| [05 — Tools Reference](../../Backenddocs/05_tools_reference.md) | Go tools en PowerShell/SQL scripts voor tenant management, encryptie, RLS verificatie, productie diagnostics |

---

## Key Capabilities

- **Multi-tenant IAM** via RS256 JWT + HttpOnly cookies
- **4-Level RBAC:** viewer → user → editor → admin
- **6 Background Workers** in één binary: Email, IMAP, Janitor, Social, Analytics, Blog Scheduler
- **Multi-Tenant Email Gateway** (SMTP + IMAP) met AES-GCM encrypted credentials
- **SSE Chat** via Redis Pub/Sub multiplexing
- **Cookieloos Analytics** met SHA-256 IP hashing
- **GDPR Janitor** — data retention en purging
- **Sentry** observability + panic recovery

---

*← [Terug naar docs/README.md](../README.md)*
