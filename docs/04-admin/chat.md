# Interne Chat

## Beschrijving

De interne chat is beschikbaar als **zijbalk** in het admin panel voor alle admins en editors.  
**Component folder:** `src/components/chat/`  
**Convex module:** `chat.ts`

---

## Technologie

De chat is volledig gebaseerd op **Convex realtime subscriptions** — geen SSE of Redis nodig voor de frontend chat UI. De presence (online indicator) gebruikt wél een heartbeat via Convex:

```
React Island → Convex useQuery (direct_messages) →
  ← Realtime updates via Convex WebSocket
```

---

## Convex Tabellen

De chat gebruikt **vier aparte Convex tabellen**:

| Tabel | Doel |
|---|---|
| `direct_messages` | 1-op-1 privéberichten |
| `group_conversations` | Groepsgesprekken (naam, leden) |
| `group_messages` | Berichten in groepsgesprekken |
| `presence` | Realtime aanwezigheid (heartbeat) |

---

## Functies

### 1-op-1 Directe Berichten (DM)
- Stuur een privébericht naar een specifiek teamlid
- Realtime levering via Convex subscription
- `isRead` voor leesbevestiging
- `conversationId` is deterministisch: `[min(a,b), max(a,b)].join(":")`

### Groepsgesprekken
- Aangemaakt in `group_conversations` (naam, leden als array van e-mails)
- Berichten in `group_messages` gelinkt via `groupId`
- Emoji avatar per groep (`avatarEmoji`)

### Realtime Aanwezigheid (Presence)

**Tabel:** `presence`

- Frontend stuurt heartbeat elke **60 seconden**
- Gebruiker is offline als `lastActive > 120s` geleden
- Toont groene stip = online, grijs = offline
- Slaat ook op wie de gebruiker aan het typen is naar (`typingTo`, auto-expires na 3s)
- Bevat ook `currentPath` — optioneel: waar de gebruiker is

### Emoji Reacties

- Zowel `direct_messages` als `group_messages` ondersteunen `reactions` arrays
- Elke reactie bevat: `emoji`, `user`, `name`

---

## Berichttypen

Zowel directe berichten als groepsberichten hebben een `type`:

| Type | Gebruik |
|---|---|
| `text` | Gewone tekstberichten |
| `image` | Afbeeldingen |
| `system` | Systeemberichten (bijv. "gebruiker toegevoegd") |

---

*← [team.md](./team.md) · Volgende: [analytics.md](./analytics.md)*
