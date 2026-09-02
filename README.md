# School Monitor — Geospatial School Monitoring Platform

A multi-tenant SaaS for infrastructure, enrollment, and security monitoring across
government and private education institutions — built for ministry/management
decision-making on material distribution, interventions, and rescue/security response.

## Structure

```
apps/
  api/      NestJS backend (Prisma + PostgreSQL)
  web/      React + Vite + MapLibre dashboard (ministry/management decision-support UI)
  mobile/   Expo (React Native) field data collection app - offline-first institution
            registration and facility condition logging (see apps/mobile/README.md)
packages/
  shared/   Shared TypeScript types/enums used across api/web/mobile
```

## Phase 1 scope

- Multi-tenant institution registry with a **configurable admin-region hierarchy**
  (e.g. State → LGA → School), so each tenant can model its own reporting structure.
- **Facility condition tracking** (classrooms, toilets, water, electricity, etc.)
- **Enrollment records**
- **Interventions**: material distribution, infrastructure repair, security
  deployment, and rescue operations — tracked from planned through completion.
- **Security incidents**: reporting and response-status tracking, separate from
  routine inspection.
- **Priority Dashboard**: institutions ranked by a computed urgency score
  (facility condition + missing critical infrastructure + open security incidents
  + enrollment size) — the core decision-support view for ministry/management users.
- **Mobile field data collection** (Expo/React Native): institution registration and
  facility condition logging with GPS capture, offline-first submission queue, and
  auto-sync on reconnect. See `apps/mobile/README.md` for setup and EAS build instructions.

PostGIS spatial queries (proximity search, catchment areas) are deferred to Phase 3;
lat/lng are stored as plain floats for now.

## Local development

Requires Node 20+ and a PostgreSQL database.

```bash
npm install

# apps/api
cp apps/api/.env.example apps/api/.env   # set DATABASE_URL, JWT_SECRET
npm run prisma:migrate:dev --workspace=apps/api
npm run prisma:seed --workspace=apps/api
npm run dev:api

# apps/web (separate terminal)
cp apps/web/.env.example apps/web/.env   # set VITE_API_URL to the API's URL
npm run dev:web
```

Seed login: `admin@demo-tenant.test` / `ChangeMe123!` — **change this immediately**
in any non-local environment.

## Deploying to Railway

Deploy as **two Railway services** from this one repo, plus a Postgres plugin:

1. **Postgres**: Add the Railway Postgres plugin to your project. It sets
   `DATABASE_URL` automatically for any service you link it to.

2. **API service**:
   - Root/source directory: `apps/api`
   - Railway auto-detects `apps/api/railway.json` (Nixpacks build, runs
     `prisma migrate deploy` before starting).
   - Link the Postgres plugin so `DATABASE_URL` is injected.
   - Set env vars: `JWT_SECRET` (generate with `openssl rand -base64 32`),
     `CORS_ORIGIN` (your web service's public URL once you have it).
   - After first deploy, run the seed script once via Railway's shell:
     `npm run prisma:seed --workspace=apps/api`

3. **Web service**:
   - Root/source directory: `apps/web`
   - Uses `apps/web/railway.json` (builds with `npm run build`, serves with
     `npm run preview`).
   - Set env var: `VITE_API_URL` to the API service's public Railway URL
     (e.g. `https://school-monitor-api-production.up.railway.app/api/v1`).

4. Once both are up, update the API's `CORS_ORIGIN` to the web service's
   public URL and redeploy the API.

## Security notes for a multi-tenant, government-facing platform

- All data access in the API is scoped by `tenantId` derived from the JWT —
  never trust a client-supplied tenant ID.
- Rotate `JWT_SECRET` and the seeded admin password before any real deployment.
- For government contracts requiring data residency or dedicated hosting,
  plan for a separate Railway project (or alternate host) per tenant rather
  than the shared multi-tenant deployment — see the architecture doc for the
  reasoning.
