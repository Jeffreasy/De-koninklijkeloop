# Git Workflow

## Branch Strategie

| Branch | Doel |
|---|---|
| `main` | Productie — altijd deployable |
| `develop` | Integratiebranch voor features |
| `feature/[naam]` | Nieuwe features |
| `fix/[naam]` | Bug fixes |
| `hotfix/[naam]` | Urgente productie fixes |

---

## Workflow

```bash
# 1. Begin altijd vanuit main
git checkout main
git pull origin main

# 2. Maak een feature branch
git checkout -b feature/donatie-export

# 3. Maak je wijzigingen, commit regelmatig
git add .
git commit -m "feat(donations): add CSV export button"

# 4. Push naar remote
git push origin feature/donatie-export

# 5. Open een Pull Request naar main (of develop)
```

---

## Commit Messages — Conventional Commits

Format: `type(scope): beschrijving`

| Type | Gebruik |
|---|---|
| `feat` | Nieuwe functionaliteit |
| `fix` | Bug fix |
| `docs` | Documentatie |
| `style` | Opmaak (geen logica wijziging) |
| `refactor` | Code herstructurering |
| `test` | Tests toevoegen of aanpassen |
| `chore` | Build, tooling, dependencies |

**Voorbeelden:**
```
feat(admin): add bulk email send to participant table
fix(register): resolve validatie error for emergency phone
docs(api): update environment-variables.md met REDIS_URL
refactor(chat): verplaats SSE logic naar dedicated hook
```

---

## Pull Requests

**Titel:** Zelfde als commit message format  
**Beschrijving:** Wat is gewijzigd, waarom, en hoe te testen

**Review vereisten:**
- Minimaal 1 reviewer (Jeffrey voor backend-gerelateerde wijzigingen)
- Alle checks slagen (lint, Vercel preview build)
- `preview` deployment getest op Vercel preview URL

---

*← [code-style.md](./code-style.md) · Volgende: [review-checklist.md](./review-checklist.md)*
