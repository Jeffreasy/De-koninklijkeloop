# Lokale Ontwikkeling — Setup Guide

> Zorg eerst dat alle tools geïnstalleerd zijn: [prerequisites.md](./prerequisites.md)

---

## Vereiste Services

Voor lokale development heb je nodig:
1. **Astro frontend** — draait op `localhost:4321`
2. **Convex dev server** — verbindt met Convex Cloud dev deployment
3. **LaventeCare Go backend** — draait op `localhost:8080` (aparte repository)

---

## 1. Repository Klonen

```bash
git clone https://github.com/Jeffreasy/De-koninklijkeloop.git
cd De-koninklijkeloop
```

---

## 2. Dependencies Installeren

```bash
npm install
```

---

## 3. Environment Variables Instellen

Vraag Jeffrey voor de werkelijke waarden. Minimaal vereist in `.env`:

| Variabele | Voorbeeld | Bron |
|---|---|---|
| `PUBLIC_CONVEX_URL` | `https://frugal-goose-15.convex.cloud` | Convex dashboard |
| `PUBLIC_API_URL` | `https://laventecareauthsystems.onrender.com` | Go backend URL |
| `PUBLIC_TENANT_ID` | `b2727666-...` | Jeffrey |
| `CONVEX_DEPLOYMENT` | `dev:frugal-goose-15` | Convex dashboard |
| `PUBLIC_IMAGEKIT_URL_ENDPOINT` | `https://ik.imagekit.io/a0oim4e3e` | ImageKit |
| `IMAGEKIT_PUBLIC_KEY` | `public_...` | ImageKit |
| `IMAGEKIT_PRIVATE_KEY` | `private_...` | ImageKit (geheim) |
| `TENANT_SECRET_KEY` | `37d979ff...` | Jeffrey (geheim) |

→ Zie [environment-variables.md](./environment-variables.md) voor volledige lijst en uitleg.

---

## 4. LaventeCare Go Backend Starten

> 📄 De Go backend heeft een **aparte repository**. Zie [Backenddocs/04 Development & Testing](../../Backenddocs/04_development_testing.md) voor de volledige setup.

De Go backend draait op `localhost:8080`. Zodra de Go backend draait accepteert de Astro Vite proxy automatisch alle `/api/v1` en `/api/email` verzoeken.

---

## 5. Convex Dev Server Starten

In een **terminal venster**:

```bash
npx convex dev
```

Dit synchroniseert het Convex schema met de dev deployment in Convex Cloud. Laat dit doordraaien.

---

## 6. Astro Dev Server Starten

In een **nieuw terminal venster**:

```bash
npm run dev
```

De frontend is nu beschikbaar op [http://localhost:4321](http://localhost:4321).

---

## Optioneel: Frontend via Docker Draaien

Als je liever Docker gebruikt voor de Astro frontend:

```bash
docker compose up -d
# → start de Astro dev server in een Node.js container op poort 4321
```

> ⚠️ De `docker-compose.yml` start **alleen de Astro frontend**. De Go backend heeft zijn eigen Docker setup (aparte repo).

---

## Samenvatting Services

| Service | Hoe starten | Poort |
|---|---|---|
| **Astro frontend** | `npm run dev` | **4321** |
| **Convex dev** | `npx convex dev` | Convex Cloud |
| **Go backend** | Zie Backenddocs/04 | **8080** |

---

## Veelvoorkomende Problemen

### Fout: `PUBLIC_CONVEX_URL niet ingesteld`
→ Controleer of `.env` aanwezig is en `PUBLIC_CONVEX_URL` bevat.

### Fout: `Cannot connect to backend`
→ Zorg dat de Go backend draait op `localhost:8080`. Test: `curl http://localhost:8080/health`

### Fout: Port 4321 already in use
→ Stop een bestaand dev-process: `npx kill-port 4321`

### Fout: Convex schema mismatch
→ Run `npx convex dev` opnieuw. Als het aanhoudt: `npx convex deploy --reset`

---

*← [prerequisites.md](./prerequisites.md) · Volgende: [environment-variables.md](./environment-variables.md)*
