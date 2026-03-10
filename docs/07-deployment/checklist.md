# Pre-Deploy Checklist

Voer deze checklist uit **vóór elke productie-deployment**.

---

## ✅ Code Kwaliteit

- [ ] Alle TypeScript fouten opgelost (`npm run build` slaagt)
- [ ] Geen console.log statements in productie code
- [ ] Nieuwe environment variables gedocumenteerd in [environment-variables.md](../01-getting-started/environment-variables.md)
- [ ] Nieuwe Convex tabellen gedocumenteerd in [schema.md](../05-convex/schema.md)

## ✅ Security

- [ ] Geen geheimen (API keys, wachtwoorden) hardcoded in de code
- [ ] Nieuwe API routes hebben RBAC check
- [ ] CSP headers bijgewerkt als er nieuwe externe bronnen zijn toegevoegd (in `vercel.json`)

## ✅ Frontend

- [ ] Responsief op mobiel, tablet en desktop getest
- [ ] Dark en light mode werkt correct
- [ ] Geen broken links of missing assets
- [ ] Images hebben alt-tekst

## ✅ Convex

- [ ] `npx convex deploy` slaagt zonder errors
- [ ] Schema migrations zijn compatibel met bestaande data

## ✅ Deployment

- [ ] Environment variables zijn up-to-date in Vercel en Render.com
- [ ] Preview deployment getest op Vercel preview URL
- [ ] Geen open PR's met conflicten op `main`

## ✅ Post-Deploy Verificatie

- [ ] Homepage laadt correct: [dekoninklijkeloop.nl](https://dekoninklijkeloop.nl)
- [ ] Admin dashboard bereikbaar: [/admin/dashboard](https://dekoninklijkeloop.nl/admin/dashboard)
- [ ] Inschrijfformulier werkt: [/register](https://dekoninklijkeloop.nl/register)
- [ ] System status groen: [/admin/dashboard](https://dekoninklijkeloop.nl/admin/dashboard) → Systeemstatus widget

---

## Agent Checklist Script

```bash
python .agent/scripts/checklist.py .
```

Voert automatisch uit: Security → Lint → Schema → Tests → UX → SEO → Lighthouse

---

*← [docker.md](./docker.md) · [Terug naar docs/README.md](../README.md)*
