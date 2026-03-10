# E2E Tests — Playwright

## Setup

```bash
# Installeer Playwright
npm install -D @playwright/test
npx playwright install
```

---

## Kritieke Test Flows

### 1. Inschrijfformulier

```typescript
test('guest registration completes successfully', async ({ page }) => {
  await page.goto('/register');
  await page.fill('[name="firstName"]', 'Test');
  await page.fill('[name="lastName"]', 'Gebruiker');
  await page.fill('[name="email"]', 'test@example.com');
  await page.selectOption('[name="role"]', 'deelnemer');
  await page.selectOption('[name="distance"]', '6');
  // ... vul overige velden in
  await page.check('[name="waiverSigned"]');
  await page.check('[name="mediaPolicyAccepted"]');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL('/registratie-succes');
});
```

### 2. Login Flow

```typescript
test('login redirects to dashboard', async ({ page }) => {
  await page.goto('/login');
  await page.fill('[name="email"]', 'admin@dekoninklijkeloop.nl');
  await page.fill('[name="password"]', process.env.TEST_PASSWORD!);
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL('/admin/dashboard');
});
```

### 3. Admin Dashboard Accessibility

```typescript
test('admin dashboard loads with participant table', async ({ page }) => {
  // Login first, then...
  await page.goto('/admin/dashboard');
  await expect(page.locator('[data-testid="stats-card"]')).toBeVisible();
  await expect(page.locator('[data-testid="participant-table"]')).toBeVisible();
});
```

---

## Commando's

```bash
# Run alle E2E tests
npx playwright test

# Run met UI
npx playwright test --ui

# Specifieke test
npx playwright test tests/register.spec.ts
```

---

## Agent Script

```bash
python .agent/skills/webapp-testing/scripts/playwright_runner.py
```

---

*← [overview.md](./overview.md) · [Terug naar docs/README.md](../README.md)*
