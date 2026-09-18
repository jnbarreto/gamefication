# Leone Dev RPG (`gamefication`)

Personal gamification app — turn professional growth into an RPG with XP, quests, skills, and evidence.

## Stack

| Layer        | Tech                                                                    |
| ------------ | ----------------------------------------------------------------------- |
| API          | Node.js, TypeScript, Express, PostgreSQL                                |
| Web          | Vite, React, Tailwind CSS                                               |
| Architecture | Clean Architecture (domain → application → infrastructure → interfaces) |

## Prerequisites

- Node.js ≥ 20
- Docker & Docker Compose

## Quick start

### Option A — Docker (Postgres + API + Web)

```bash
npm install
cp .env.example .env # optional for Docker — Compose sets DATABASE_URL on api

# Start Postgres + API + Web (hot-reload)
npm run docker:up
```

- Postgres: `localhost:5432`
- API: http://localhost:3000/api/v1/health
- Web: http://localhost:5173 (proxies `/api` → API container)

Stop containers: `npm run docker:down`

Migrations run automatically on API startup. To run manually: `npm run migrate`

### Option B — Local (no Docker)

```bash
npm install
cp .env.example .env

# Requires Postgres running locally on :5432
npm run dev:api
npm run dev:web
```

## Project structure

```
apps/
├── api/     # Express backend (Clean Architecture)
└── web/     # Vite + React dashboard
.specs/      # Spec-driven artifacts
```

## Specs

See `.specs/STATE.md` for project decisions, `.specs/features/mvp/spec.md` for MVP requirements, and `.specs/design-system.md` for the Ficha Viva design system.

## Quality gates

```bash
npm run check      # format + lint + typecheck + test
npm run test:api   # Jest unit tests (API)
```
