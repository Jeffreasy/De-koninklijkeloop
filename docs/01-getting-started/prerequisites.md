# Prerequisites — Vereisten voor Lokale Ontwikkeling

> Zorg dat alle tools geïnstalleerd zijn **voordat** je `local-development.md` volgt.

---

## Verplichte Tools

| Tool | Minimale versie | Download |
|---|---|---|
| **Node.js** | 20+ (LTS) | [nodejs.org](https://nodejs.org) |
| **npm** | 10+ (meegeleverd met Node) | — |
| **Git** | 2.40+ | [git-scm.com](https://git-scm.com) |
| **Docker Desktop** | Latest | [docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop) |
| **Convex CLI** | Latest | `npm install -g convex` |

## Optioneel (aanbevolen)

| Tool | Gebruik |
|---|---|
| **VS Code** | Aanbevolen IDE — project heeft `.vscode/` configuratie |
| **PowerShell 7+** | Voor Windows dev (PowerShell scripts in `.agent/`) |
| **Go 1.22+** | Alleen nodig bij wijzigingen aan de LaventeCare backend |

---

## Vereiste Accounts & Toegang

Je hebt toegang nodig tot de volgende services (vraag Jeffrey voor credentials):

| Service | Doel | URL |
|---|---|---|
| **Convex Dashboard** | Realtime database beheer | [dashboard.convex.dev](https://dashboard.convex.dev) |
| **Vercel** | Frontend deployment | [vercel.com](https://vercel.com) |
| **ImageKit** | Media CDN | [imagekit.io](https://imagekit.io) |
| **Render.com** | LaventeCare backend hosting | [render.com](https://render.com) |
| **Sentry** | Error monitoring | [sentry.io](https://sentry.io) |

---

## Environment Variables

Je hebt twee `.env` bestanden nodig in de projectroot:

- `.env` — publieke Astro variabelen (CONVEX_URL, IMAGEKIT_PUBLIC_KEY, etc.)
- `.env.local` — privé variabelen (API keys, secrets)

→ Zie [environment-variables.md](./environment-variables.md) voor de volledige lijst.

---

## Versie Verificatie

Run deze commando's om je installaties te controleren:

```bash
node --version     # Moet 20.x.x+ zijn
npm --version      # Moet 10.x.x+ zijn
git --version      # Moet 2.40+ zijn
docker --version   # Moet actief zijn
npx convex --version
```

---

*← [Terug naar docs/README.md](../README.md) · Volgende: [local-development.md](./local-development.md)*
