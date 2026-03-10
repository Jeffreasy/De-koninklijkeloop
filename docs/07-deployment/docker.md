# Docker — Lokale Development Setup

## Wat draait er in Docker?

Het `docker-compose.yml` in de projectroot start **de Astro frontend** in een container:

| Service | Image | Poort | Doel |
|---|---|---|---|
| `frontend` | `node:20-alpine` (via Dockerfile.dev) | **4321** | Astro dev server |

> ⚠️ **De LaventeCare Go backend (postgres, redis) draait NIET in dit docker-compose.** Die heeft een eigen repository en eigen Docker setup. De Astro frontend praat via `host.docker.internal:8080` met de Go backend die lokaal draait.

---

## Commando's

```bash
# Frontend starten via Docker
docker compose up -d

# Status controleren
docker compose ps

# Logs bekijken
docker compose logs -f

# Stoppen
docker compose down
```

---

## docker-compose.yml — Werkelijke Inhoud

```yaml
services:
  frontend:
    build:
      context: .
      dockerfile: Dockerfile.dev
    container_name: de-koninklijkeloop-frontend
    ports:
      - "4321:4321"
    volumes:
      - .:/app
      - /app/node_modules
    environment:
      - NODE_ENV=development
      - API_TARGET=http://host.docker.internal:8080
      - PUBLIC_API_URL=http://host.docker.internal:8080/api/v1
    extra_hosts:
      - "host.docker.internal:host-gateway"
    restart: unless-stopped
```

---

## Dockerfile.dev — Werkelijke Inhoud

`Dockerfile.dev` bouwt de **Node.js Astro frontend** image:

```dockerfile
FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy application
COPY . .

# Astro default port
EXPOSE 4321

# Run dev server with host binding
CMD ["npm", "run", "dev", "--", "--host"]
```

---

## Backend Draaien (Lokaal, buiten Docker)

De Go backend draait **apart** van de Astro Docker container:

```bash
# Vanuit de LaventeCare repository (apart project)
docker compose up -d   # start postgres + redis + go backend

# Of direct draaien:
go run ./cmd/server
```

Na het starten zijn de services:
- Astro frontend: `http://localhost:4321`
- Go backend: `http://localhost:8080`

De Astro Vite proxy in `astro.config.mjs` stuurt `/api/v1` en `/api/email` requests automatisch door naar `localhost:8080`.

---

## Lokaal Draaien Zonder Docker

```bash
# Snelst voor dagelijkse development:
npm run dev
# → Astro start op http://localhost:4321
# → Proxy proxieert /api/v1 naar localhost:8080 (Go backend)
```

---

*← [vercel.md](./vercel.md) · Volgende: [checklist.md](./checklist.md)*
