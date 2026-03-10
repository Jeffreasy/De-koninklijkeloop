# PR Review Checklist

Gebruik deze checklist bij het beoordelen van Pull Requests.

---

## ✅ Code Kwaliteit

- [ ] Voldoet code aan de [code-style.md](./code-style.md) conventies?
- [ ] Geen `any` TypeScript types zonder goede reden?
- [ ] Geen hardcoded strings die in `site.config.ts` of constants horen?
- [ ] Zijn er onnodige `console.log` statements verwijderd?

## ✅ Functionaliteit

- [ ] Werkt de nieuwe feature zoals beschreven in de PR?
- [ ] Zijn edge cases afgehandeld?
- [ ] Is user-input gesaniteerd (`src/lib/sanitize.ts`)?

## ✅ Security

- [ ] Nieuwe API routes hebben RBAC check (juiste rol vereist)?
- [ ] Geen secrets of API keys in de code?
- [ ] Nieuwe externe bronnen toegevoegd aan CSP in `vercel.json`?

## ✅ Frontend

- [ ] Werkt op mobiel (320px+) en desktop?
- [ ] Dark EN light mode correct?
- [ ] Geen `purple-*` of `violet-*` Tailwind classes (Purple Ban)?
- [ ] Afbeeldingen hebben alt-tekst?
- [ ] Nieuwe Islands hebben de juiste `client:*` hydration directive?

## ✅ Convex

- [ ] Schema wijzigingen zijn backward compatible?
- [ ] Nieuwe queries/mutations zijn type-safe?
- [ ] Geen N+1 queries (gebruik `.collect()` spaarzaam)?

## ✅ Documentatie

- [ ] Nieuwe features gedocumenteerd in de juiste sectie van `docs/`?
- [ ] Nieuwe environment variables toegevoegd aan [environment-variables.md](../01-getting-started/environment-variables.md)?

## ✅ Tests

- [ ] Critieke flows getest (manueel of via Playwright)?

---

*← [git-workflow.md](./git-workflow.md) · [Terug naar docs/README.md](../README.md)*
