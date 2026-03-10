# Social Media Beheer

## Beschrijving

De social media module (`/admin/social`) beheert DKL social media posts en de X (Twitter) campagnes.

---

## Social Posts (Convex-based)

**Component:** `SocialManagerIsland.tsx`  
**Convex module:** `socialPosts.ts` · **Tabellen:** `social_posts`, `social_reactions`

### Post Aanmaken

**Component:** `SocialPostModal.tsx` (34KB)

Een post bevat:
- Caption tekst (`caption`)
- Instagram URL (`instagramUrl`)
- Afbeelding URL (`imageUrl`) — of thumbnail bij video
- Video URL (`videoUrl`) — Streamable URL (optioneel)
- Carousel `mediaItems` array — meerdere foto's en/of videos
- Jaar (`year`): "2024", "2025", "2026"

### Post Zichtbaarheid

Sociale posts gebruiken **twee boolean velden** (geen status enum):

| Veld | Type | Beschrijving |
|---|---|---|
| `isVisible` | boolean | Zichtbaar op website |
| `isFeatured` | boolean | Uitgelicht op homepage/grid |

> **Let op:** Er is **geen** `status` enum op social posts. Zichtbaarheid wordt geregeld via `isVisible: true/false`.

### Overzicht

**Component:** `SocialPostCard.tsx`  
Toont per post: caption preview, media thumbnail, datum en zichtbaarheidsstatus.

Filter: per jaar (`year` field)

### Emoji Reacties

**Tabel:** `social_reactions`

Websitebezoekers kunnen reageren op posts met emoji's (❤️, 👍, 😍, 🔥, 👏).  
Eén reactie per gebruiker per post (`by_user_post` index).

---

## X (Twitter) Poster — Administrator Only

**Route:** `/admin/x-poster`  
**Componenten:** `XPosterIsland.tsx`, `XPostEditor.tsx`, `XCampaignModal.tsx`, `XConfigPanel.tsx`

### Functies

- X campagnes beheren per periode
- Posts schrijven en inplannen (direct of gepland)
- Publiceren via X API
- Budget widget: campagnekosten bijhouden

### Configuratie

**Component:** `XConfigPanel.tsx` (15KB)  
- X API credentials (Bearer Token, API Key)
- Automatische post verificatie

---

*← [email.md](./email.md) · Volgende: [blog.md](./blog.md)*
