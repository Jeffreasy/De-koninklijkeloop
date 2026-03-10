# Test Strategie — Overzicht

## Test Piramide

```
        E2E (Playwright)
       /                 \
    Integration Tests
   /                       \
  Unit Tests (meest uitgebreid)
```

---

## Unit Tests

**Focus:** Utility functies, helper logica, data transformaties

```bash
npm test                    # Run alle tests
npm test -- --watch         # Watch mode
```

Bestanden: `*.test.ts` naast het bronbestand

**Aandachtspunten:**
- `src/lib/sanitize.ts` — input sanitizatie
- `src/lib/analytics.ts` — analytics utility functies
- Convex query/mutation handlers (via Convex test runner)

---

## Integration Tests

**Focus:** API routes, Convex mutations, auth flows

```bash
# Convex integration tests
npx convex test
```

---

## E2E Tests (Playwright)

→ Zie [e2e.md](./e2e.md) voor details

**Kritieke flows die getest worden:**
1. Inschrijfformulier completing → registratie-succes
2. Login flow (inclusief redirect)
3. Admin dashboard accessibility check

---

## Agent Test Scripts

```bash
# Run alle tests via agent checklist
python .agent/skills/testing-patterns/scripts/test_runner.py

# Playwright E2E
python .agent/skills/webapp-testing/scripts/playwright_runner.py

# Lint check
python .agent/skills/lint-and-validate/scripts/lint_runner.py
```

---

## Backend Tests (Go)

→ Zie [Backenddocs/04 Development & Testing](../../Backenddocs/04_development_testing.md)

Vereiste coverage:
- Unit tests voor alle business logic
- Integration tests voor API endpoints
- RBAC tests (elke route op elk rol-niveau)
- Worker tests (email, IMAP, analytics workers)

---

*← [Terug naar docs/README.md](../README.md)*
