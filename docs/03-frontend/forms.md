# Formulieren — Technische Documentatie

## 1. Inschrijfformulier (`/register`)

**Component:** `src/components/islands/RegisterIsland.tsx` (52KB — meest complex)  
**Convex mutations:** `register.ts`, `registerGuest.ts`

### Registratietypen

| Type | Beschrijving | Account vereist |
|---|---|---|
| **Gast** | Snel inschrijven zonder account | ❌ |
| **Account** | Met LaventeCare account + dashboard toegang | ✅ |

### Velden

**Basis (alle types):**
- Voornaam, achternaam, e-mailadres
- Geboortedatum
- Telefoonnummer
- Rol: Deelnemer / Begeleider / Vrijwilliger
- Afstand (indien Deelnemer): 2.5 / 6 / 10 / 15 km

**Uitgebreid:**
- T-shirtmaat (XS t/m 3XL)
- Pendelbus (ja/nee)
- Rolstoelgebruik (ja/nee)
- Noodcontact naam + telefoonnummer

**Juridisch:**
- Akkoord deelnamevoorwaarden ✅ (verplicht)
- Akkoord mediabeleid ✅ (verplicht)
- Naam als waiver-bevestiging

### Flow

```
1. Formulier invullen
2. Validatie (Zod schema client-side)
3. POST naar Convex mutation (register of registerGuest)
4. Go backend verstuurt bevestigingsmail
5. Redirect naar /registratie-succes
```

### Gast Claim Flow

Gastgebruikers kunnen achteraf een account aanmaken en hun inschrijving claimen via `convex/claimGuest.ts`.

---

## 2. Login Formulier (`/login`)

**Component:** `src/components/islands/LoginForm.tsx` (34KB)

### Flow

```
1. E-mail + wachtwoord invullen
2. POST naar /api/auth/login → Go backend
3. HttpOnly cookies gezet (access_token + refresh_token)
4. Als MFA ingeschakeld: TOTP-code vereist stap 2
5. Redirect naar /dashboard of oorspronkelijke URL
```

### Token Refresh

Wanneer de access token (15min) verloopt:
- Automatische refresh via de refresh token (7 dagen)
- Bij verlopen refresh token → redirect naar `/login`

---

## 3. Contactformulier (`/contact`)

**Component:** `src/components/islands/ContactForm.tsx`  
**Pattern:** Hybrid Convex/Go

### Flow

```
1. Naam + e-mail + bericht invullen
2. Submit → Convex `contact.ts` mutation (voor real-time opslag)
3. Convex Action → roept Go backend aan voor SMTP delivery
4. E-mail gaat naar info@dekoninklijkeloop.nl
5. Bevestiging aan afzender
```

---

## 4. Profiel Bewerken

**Component:** `src/components/islands/ParticipantEditModal.tsx` (22KB)  
**Convex:** `participant.ts` mutation

### Bewerkbare velden
- Voornaam, achternaam
- Telefoonnummer
- T-shirtmaat
- Pendelbus voorkeur
- Noodcontact informatie

---

## Formulier Validatie

Alle formulieren gebruiken **Zod** voor schema-validatie:

```typescript
import { z } from 'zod';

const registrationSchema = z.object({
  firstName: z.string().min(2).max(50),
  lastName: z.string().min(2).max(50),
  email: z.string().email(),
  role: z.enum(['deelnemer', 'begeleider', 'vrijwilliger']),
  distance: z.enum(['2.5', '6', '10', '15']).optional(),
  // ...
});
```

### Error Handling

```typescript
// Client-side validatie
const result = registrationSchema.safeParse(formData);
if (!result.success) {
  setErrors(result.error.flatten().fieldErrors);
  return;
}
```

---

## Sanitizatie

Input wordt gesaniteerd via `src/lib/sanitize.ts` voor alle server-side verwerking. De Go backend gebruikt een eigen "Input is Toxic" validatielaag.

---

*← [pages.md](./pages.md) · [Terug naar docs/README.md](../README.md)*
