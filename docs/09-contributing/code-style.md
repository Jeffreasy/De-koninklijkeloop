# Code Stijl & Conventies

## Principes

Het project volgt "Clean Code" principes:
- **Concise** — geen onnodige abstracties
- **Self-documenting** — code beschrijft zichzelf
- **No over-engineering** — YAGNI (You Aren't Gonna Need It)

---

## TypeScript

- **Strikte typing** — altijd types definiëren, geen `any`
- **Interfaces** boven `type` voor publieke API's
- **Zod** voor runtime validatie van gebruikersinput

```typescript
// ✅ Correct
interface Participant {
  id: string;
  name: string;
  role: 'deelnemer' | 'begeleider' | 'vrijwilliger';
}

// ❌ Fout
const x: any = getData();
```

---

## React / JSX

- **Functionele componenten** — geen class components
- **Kleine componenten** — één verantwoordelijkheid per component
- **Composable** — props boven globale state
- Custom hooks voor herbruikbare logica (`use` prefix)

```tsx
// ✅ Correct — beschrijvende naam, kleine component
export function ParticipantBadge({ role }: { role: ParticipantRole }) {
  return <span className={getRoleBadgeClass(role)}>{role}</span>;
}

// ❌ Fout — teveel verantwoordelijkheden in één component
```

---

## Astro Componenten

- Server-side logica in frontmatter (`---`)
- Geen client-side JS tenzij nodig (`client:*` directive)
- Islands alleen voor werkelijk interactieve UI

---

## Naamgeving

| Type | Conventie | Voorbeeld |
|---|---|---|
| Component bestanden | PascalCase | `ParticipantTable.tsx` |
| Utility bestanden | camelCase | `analytics.ts` |
| Astro pagina's | kebab-case | `registratie-succes.astro` |
| Variabelen/functies | camelCase | `getParticipants()` |
| Constants | UPPER_SNAKE_CASE | `MAX_DISTANCE_KM` |
| Types/Interfaces | PascalCase | `ParticipantRole` |

---

## Commentaar

Commentaar in het **Engels** (voor internationale samenwerking en LLM tools).  
Commentaar alleen voor **niet-voor-de-hand-liggende** beslissingen:

```typescript
// ✅ Nuttig commentaar: legt WHY uit
// Cache TTL van 5 minuten beschermt tegen ImageKit rate-limiting
const CACHE_TTL = 5 * 60 * 1000;

// ❌ Nutteloos commentaar: beschrijft WHAT (dat doet de code al)
// Increment counter
counter++;
```

---

## Imports

Volgorde van imports:
1. Node.js / externos packages
2. Interne lib/utilities
3. Componenten
4. Types

```typescript
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { formatDate } from '../../lib/utils';
import { ParticipantCard } from './ParticipantCard';
import type { Participant } from '../../types/participant';
```

---

## Styling (Tailwind v4)

- **Utility-first** — geen custom CSS tenzij echt nodig
- **Semantic klassen** via CSS variabelen
- **Geen `purple-*` of `violet-*`** (Purple Ban)
- Responsive via `sm:`, `md:`, `lg:` prefixes

---

*← [Terug naar docs/README.md](../README.md) · Volgende: [git-workflow.md](./git-workflow.md)*
