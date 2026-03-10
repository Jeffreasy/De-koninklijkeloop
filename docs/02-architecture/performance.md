# Performance Architectuur

## Kernprincipes

1. **Meten eerst** — geen optimalisatie zonder meetbare baseline
2. **Islands boven full hydration** — minimaliseer JavaScript bundle
3. **CDN-first** — alle media via ImageKit, geen eigen origin serving
4. **Defensive SSR** — externe API-failures mogen nooit de pagina neerleggen

---

## Video Facade Pattern

**Probleem:** Video-embeds (Streamable) laden direct bij page load → blokkeren LCP, hoge bandwidth.

**Oplossing:** Videos worden "geblokkeerd" achter een thumbnail. Pas bij klik wordt de iframe geladen.

```tsx
// VideoShowcase.tsx — Video Facade Pattern
const [activated, setActivated] = useState(false);

return activated ? (
  <iframe src={streamableUrl} allow="autoplay" />
) : (
  <img src={thumbnail} onClick={() => setActivated(true)} />
);
```

**Impact:** Initieel paginagewicht gereduceerd met >5MB op /media pagina.

---

## ImageKit CDN Integratie

### Module-Level Caching (Cloudinary Admin API)

Admin API calls (lijsten, mappenstructuur) worden gecached op module-niveau:

```typescript
// In-memory cache per module instantie
let cachedFolders: Folder[] | null = null;
let lastFetch: number = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minuten

async function getFolders() {
  if (cachedFolders && Date.now() - lastFetch < CACHE_TTL) {
    return cachedFolders;
  }
  cachedFolders = await imageKitAdmin.listFolders();
  lastFetch = Date.now();
  return cachedFolders;
}
```

**Impact:** Beschermt tegen rate-limiting en verbetert SSR latency.

### Transformaties

ImageKit URL-transformaties worden inline in de URL meegegeven:
```
https://ik.imagekit.io/dkl/tr:w-800,h-600,q-80/event-2025/foto.jpg
```

---

## Defensive SSR — Try-Catch Boundaries

Elke externe data-fetch gebruikt een try-catch boundary:

```astro
---
let mediaItems = [];
try {
  mediaItems = await fetchCloudinaryMedia();
} catch (e) {
  console.error('Cloudinary unavailable, using fallback', e);
  mediaItems = STATIC_FALLBACK_MEDIA;
}
---
```

**Impact:** Cloudinary en Streamable timeouts crashen de pagina niet.

---

## Mixed Data Fallback Pattern

Op de mediapagina wordt een mixstrategie gebruikt:
1. Probeer dynamische data (recente eventfolder) op te halen
2. Als leeg of gefaald: vul aan met statische fallback dataset
3. Resultaat: altijd een volle, rijke mediagalerij

---

## Service Worker & Cache Busting

**Probleem (opgelost):** Legacy Service Workers ("Zombie Workers") op user-devices bleven gecachede oude versies serveren.

**Oplossing (Nuclear Level 3):**
1. `Clear-Site-Data: "cache"` header op deployment
2. `Vary: Accept-Encoding, User-Agent` voor mobile proxies
3. Actieve Service Worker registratie die legacy workers force-unregistert

---

## Core Web Vitals Targets

| Metric | Target | Hoe bereikt |
|---|---|---|
| **LCP** | < 2.5s | Video Facade, ImageKit CDN, SSR HTML |
| **CLS** | < 0.1 | Expliciete afbeeldingsdimensies, skeleton loaders |
| **INP** | < 200ms | Minimale Islands hydration, Nano Stores |
| **TTFB** | < 200ms | Vercel Edge SSR, module-level caching |

---

## Tools

```bash
# Bundle analyse
python .agent/skills/performance-profiling/scripts/bundle_analyzer.py

# Lighthouse audit
python .agent/skills/performance-profiling/scripts/lighthouse_audit.py
```

---

*← [security-model.md](./security-model.md) · [Terug naar docs/README.md](../README.md)*
