# Design System — DKL Visual Identity

> Gebaseerd op `src/styles/global.css` (de enige CSS bron van waarheid)

---

## Kernprincipes

Het DKL design systeem is gebouwd op twee thema's:
- **"Deep Tech" (Dark mode)** — standaard, `color-scheme: dark`, glassmorphism, premium feel
- **"Clear Sky" (Light mode)** — via `[data-theme="light"]` HTML attribuut op `<html>`

---

## Kleurenpalet (Exacte Waarden uit global.css)

### Brand Kleuren

| Token | Waarde | Gebruik |
|---|---|---|
| `--color-brand-orange` | `hsl(30 100% 58%)` = `#ff9328` | Primaire accent kleur, oranje glow |
| `--color-brand-blue` | `hsl(222 47% 11%)` = `#0f172a` | Donker blauw (Slate-900) |
| `--color-brand-blue-light` | `hsl(215 25% 27%)` = `#334155` | Medium blauw (Slate-700) |
| `--color-action-blue` | `hsl(221 83% 53%)` = `#2563eb` | Interactief blauw |

### Dark Mode (`:root` — Standaard)

| Variabele | Waarde | Tailwind equivalent |
|---|---|---|
| `--bg-body` | `#020617` | Slate-950 |
| `--bg-surface` | `#0f172a` | Slate-900 |
| `--text-primary` | `#f8fafc` | Slate-50 |
| `--text-secondary` | `#e2e8f0` | Slate-200 |
| `--text-muted` | `#94a3b8` | Slate-400 |
| `--accent-primary` | `#ff9328` | Brand Orange |
| `--glass-bg` | `rgba(15, 23, 42, 0.75)` | Semi-transparant blauw |

### Light Mode (`[data-theme="light"]`)

| Variabele | Waarde |
|---|---|
| `--bg-body` | `#f1f5f9` (Slate-100) |
| `--bg-surface` | `#ffffff` |
| `--text-primary` | `#0f172a` (Slate-900) |
| `--text-muted` | `#64748b` (Slate-500) |
| `--accent-primary` | `#f97316` (iets verzadigder oranje) |

### Status Kleuren

| Status | Kleur | RGB |
|---|---|---|
| `--success` | Groen | `rgb(34, 197, 94)` |
| `--warning` | Amber | `rgb(234, 179, 8)` |
| `--error` | Rood | `rgb(239, 68, 68)` |
| `--info` | Blauw | `rgb(59, 130, 246)` |

> ⚠️ **Purple/Violet Ban** — nooit `purple-*` of `violet-*` Tailwind classes gebruiken.

---

## Typografie (Gedefinieerd in global.css)

| Rol | Font | CSS token | Gebruik |
|---|---|---|---|
| **Display/Headings** | **Bebas Neue** | `--font-display` | Hero titels, grote koppen |
| **Body tekst** | **Source Sans 3** | `--font-body` | Alle lopende tekst |
| **Admin UI** | **Inter** | `--font-admin` | Admin panel interface |

> ⚠️ **Let op:** De body font is **Source Sans 3** (niet Inter). Admin UI gebruikt Inter.

### Font Styling

```css
/* Bebas Neue heeft extra letter-spacing nodig */
.font-display {
  letter-spacing: 0.02em;
  line-height: 1.15;
}
```

---

## Glassmorphism Utilities

Beschikbaar als globale Tailwind utilities in `global.css`:

| Utility | Beschrijving | Gebruik |
|---|---|---|
| `glass` | `backdrop-blur-2xl` + semi-trans bg | Navigatie |
| `glass-card` | `backdrop-blur-xl` + shadow | Content cards |
| `premium-glass` | `backdrop-blur-3xl` + shadow-2xl | Modals, feature cards |

```css
/* Mobiele optimalisatie: blur is gereduceerd */
@media (max-width: 768px) {
  .glass-card    { backdrop-filter: blur(12px); }   /* xl → md */
  .premium-glass { backdrop-filter: blur(24px); }   /* 3xl → xl */
}
```

---

## Achtergrond Glow Effect (Exacte Implementatie)

De glow bestaat uit **twee vaste `<div>` elementen** in `BaseLayout.astro`:

```html
<!-- Glow container — fixed, achter alle content (z-index: -10) -->
<div class="glow-container">
  <div class="glow glow-blue"></div>   <!-- Top-center: blauw pad highlight -->
  <div class="glow glow-orange"></div> <!-- Bottom-right: warm oranje glow -->
</div>
```

**CSS positionering:**

| Glow | Positie | Grootte | Kleur |
|---|---|---|---|
| `.glow-blue` | Top-center (`top: -20%`, `left: 50%`) | `70vw × 60vh` | `--color-action-blue` (25% opacity) |
| `.glow-orange` | Bottom-right (`bottom: -15%`, `right: -10%`) | `55vw × 55vh` | `--color-brand-orange` (20% opacity) |

Beide glows gebruiken `filter: blur(80px)` en `position: fixed` (nooit scrollen, ook niet op mobiel).

---

## Extra CSS Utilities

| Utility | Effect |
|---|---|
| `text-royal-gradient` | Oranje gradient tekst met drop shadow |
| `bg-dots-pattern` | Puntjesraster (15% opacity) |
| `scrollbar-hide` | Verberg scrollbar (cross-browser) |
| `custom-scrollbar` | Oranje/blauw gradient scrollbar |

---

## Iconen

Het project gebruikt **twee iconensystemen**:

```tsx
// Lucide React (inline, gebundeld)
import { User, Settings, Mail } from 'lucide-react';

// Iconify (CDN, uitgebreid assortiment)
// <iconify-icon icon="mdi:calendar" />
// CLS-preventie is geregeld in global.css (display: inline-block, contain: layout)
```

---

## Animaties & Transitions

- **Hover:** `transition-all duration-200 ease-in-out`
- **Modal open/close:** `transition-opacity duration-300`
- **Skeleton loaders:** `animate-pulse`
- **Toast notificaties:** `slideUp` keyframe animatie (in global.css)
- **Thema overgang:** `transition-property: background-color, color; duration: 300ms`

---

## Dark/Light Theme Toggle

**Component:** `src/components/islands/ThemeToggle.tsx`

- Slaat voorkeur op in **localStorage**
- Valt terug op `prefers-color-scheme` als geen voorkeur opgeslagen
- Het attribuut **`data-theme`** wordt op het `<html>` element gezet:

```html
<!-- Dark mode (standaard) -->
<html>

<!-- Light mode (via toggle) -->
<html data-theme="light">
```

> **Let op:** Dit is `data-theme="light"`, **niet** `class="dark"` of `class="light"`.

---

*← [Terug naar docs/README.md](../README.md) · Volgende: [components.md](./components.md)*
