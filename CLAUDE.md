# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## App

Standalone Vite + React 19 + TypeScript + Tailwind v4 patient web app. React Compiler enabled via `@vitejs/plugin-react`. Wraps `@telegram-apps/sdk` for Telegram WebApp embedding. Previously part of a `hospital-ai/` monorepo with a sibling doctors app; now split out — the parent `../CLAUDE.md` describing two linked apps is stale for this repo.

Dev port: **3002**. No test runner configured.

## Commands

```
npm install
npm run dev       # vite --port 3002 --open
npm run build     # tsc -b && vite build
npm run lint      # eslint .
npm run preview
```

## Environment

`src/api/client.ts` reads:

- `VITE_API_URL` — backend base, default `http://localhost:4000/api/v1`
- `VITE_USE_MOCKS` — `"true"` enables mock-data mode (`src/mocks/data.ts`)

## Architecture

### Entry + auth guard

`src/App.tsx` composes one `QueryClient`, `ToastContainer`, `BrowserRouter`, and a `PatientGuard` that reads `token` from `usePatientAuth` and redirects to `/login`. All authenticated routes nest under `PatientLayout` inside the guard. Add new protected pages as children of that route.

`src/main.tsx` calls `localStorage.removeItem("lang")` on every load — language is not persisted across reloads.

### Auth + axios

`src/api/client.ts` is a single axios instance. Request interceptor reads the `patient-auth` localStorage key (the `name` used by the Zustand `persist` middleware in `src/stores/patientAuth.ts`) and attaches `Bearer <token>`. Renaming the store breaks token attachment silently.

### State

- Server state: TanStack Query, one `QueryClient` in `App.tsx`.
- Client state: Zustand in `src/stores/`. `patientAuth` uses `persist`. `langStore` mirrors i18n.

### i18n

`src/i18n.ts` + `i18next-http-backend` loading `/i18n/{{lng}}/translation.json` from `public/i18n/`. Languages: `en`, `ru`, `uz`. New keys require edits to all three JSON files.

### Mocks + types

`src/mocks/data.ts` holds typed fixtures. `src/types/index.ts` is the source of truth for both mock and real API shapes.

### Pages

`src/pages/patient/`: Home, Checklist, Medications, Diet, AIChat, CheckIn, Profile, AnonymousReport. Login at `src/pages/patient/PatientLoginPage.tsx`. `DietPage` is still routed at `/diet` but removed from the bottom nav (replaced by AI Chat).

## Deployment

Vercel. `vercel.json` rewrites all paths to `/index.html` for React Router SPA fallback.
