# Media Beheer

## Beschrijving

Het mediabeheer (`/admin/media`) beheert alle foto's via de ImageKit CDN.

---

## Overzicht

**Component:** `MediaManagerIsland.tsx`

De mediabibliotheek toont alle foto's gegroepeerd per:
- **Map** (bijv. `2024/`, `2025/`, aankomende editie)
- **Jaar** (filter: 2024 / 2025 / 2026)

---

## Upload Flow

### Server-Side Signed Upload

De upload gebruikt een **server-side signed request** om de private ImageKit key veilig te houden:

```
1. Admin klikt upload knop → ServerSideUploadButton.tsx
2. Browser → POST /api/media/upload-token (Astro API route)
3. Astro server genereert signed token via IMAGEKIT_PRIVATE_KEY
4. Browser → directe upload naar ImageKit met token
5. Metadata opgeslagen in Convex (mediaMetadata.ts)
```

**Component:** `ServerSideUploadButton.tsx` (10KB)

---

## Moderatiestatus

Elke foto heeft een moderatiestatus:

| Status | Beschrijving | Zichtbaar publiek |
|---|---|---|
| `pending` | Wacht op beoordeling | ❌ |
| `approved` | Goedgekeurd | ✅ |
| `rejected` | Afgekeurd | ❌ |
| `archived` | Gearchiveerd | ❌ |

---

## Metadata Bewerken

**Component:** `MediaDetailModal.tsx` (17KB)

Per foto bewerkbaar:
- Alt-tekst (SEO + accessibiliteit)
- Tags (voor filteren)
- Moderatiestatus wijzigen

---

## Media Toolbar

**Component:** `MediaToolbar.tsx` (8KB)

Bevat:
- Map/jaar filter
- Zoekbalk
- Sorteeropties
- Weergave toggle (grid / lijst)

---

## Convex Schema

Mediametadata wordt opgeslagen in Convex (`mediaMetadata.ts`):

```typescript
// Velden in media_metadata tabel
imageKitFileId: string      // Unieke ImageKit file ID
fileName: string           
url: string                // ImageKit URL
altText: string            // Alt tekst
tags: string[]             
status: "pending" | "approved" | "rejected" | "archived"
uploadedBy: string         // Admin user ID
uploadedAt: number         // Timestamp
folder: string             // Map in ImageKit
```

---

## Publieke Mediagalerij

De goedgekeurde foto's zijn zichtbaar op `/media` via:
- `LiveImageGrid.tsx` — publieke fotogalerij island
- `MediaLightboxModal.tsx` — klik om te vergroten

---

*← [registrations.md](./registrations.md) · Volgende: [email.md](./email.md)*
