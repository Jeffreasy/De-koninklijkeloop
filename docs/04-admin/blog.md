# Blog Beheer

> ⚠️ **Administrator only** — alleen toegankelijk voor de `admin` rol

## Beschrijving

Het blog beheer (`/admin/blog`) beheert alle content op de DKL blog.  
**Convex module:** `blog.ts` · **Tabellen:** `blog_posts`, `blog_categories`, `blog_comments`, `blog_config`

---

## TipTap Rich Text Editor

**Component:** `BlogPostEditor.tsx` (23KB)  
**Versie:** TipTap v3 (`@tiptap/react ^3.19.0`)

De editor ondersteunt:
- Koppen (H1-H6)
- Vetgedrukt, cursief, underline
- Geordende en ongeordende lijsten
- Blockquotes
- Afbeeldingen invoegen (via `@tiptap/extension-image`)
- Links (via `@tiptap/extension-link`)

De editor slaat de output op als **HTML** in het `content` veld van `blog_posts`.

---

## Blog Post Statussen

Statussen zijn **Engelstalig** in de Convex schema:

| Status | Beschrijving | Publiek zichtbaar |
|---|---|---|
| `draft` | Wordt geschreven | ❌ |
| `review` | Klaar voor beoordeling | ❌ |
| `published` | Live op /blog | ✅ |
| `scheduled` | Gepland voor publicatie | ❌ → ✅ op geplande datum |
| `archived` | Oud, niet meer actief | ❌ |

---

## SEO Velden (per post)

| Convex veld | Beschrijving |
|---|---|
| `seo_title` | SEO meta-titel |
| `seo_description` | SEO meta-beschrijving |
| `slug` | URL slug (bijv. `nieuw-parcours-2026`) |
| `cover_image_url` | Hoofdafbeelding URL |

---

## Categorieën

**Tabel:** `blog_categories`  
**Component:** `BlogCategoryManager.tsx`

Elke post heeft één categorie (`category_id`). De `blog_posts` tabel denormaliseert ook `category_name` en `category_slug` voor leesperformance.

---

## Reactie Moderatie

**Tabel:** `blog_comments`  
**Component:** `BlogCommentMod.tsx` (8KB)

Reactiestatus:

| Status | Effect |
|---|---|
| `pending` | Wacht op beoordeling (standaard) |
| `approved` | Reactie zichtbaar op de blog |
| `rejected` | Reactie verborgen |

Reacties ondersteunen **reply threading** via `parent_id`.

---

## Blog Configuratie

**Tabel:** `blog_config`  
**Component:** `BlogConfigPanel.tsx`

- `enabled` — Blog aan/uit
- `comments_enabled` — Reacties aan/uit
- `posts_per_page` — Paginering

---

## RSS Feed

Alle gepubliceerde blog posts zijn beschikbaar via `/rss.xml`.

---

*← [social-media.md](./social-media.md) · Volgende: [pr-communication.md](./pr-communication.md)*
