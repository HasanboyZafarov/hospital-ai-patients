# hospital-ai-patients

Patient-facing mobile web app for the Hospital AI post-op recovery platform. Standalone Vite + React 19 + TypeScript + Tailwind v4 SPA. Talks to the Hospital AI REST API and embeds inside Telegram WebApp via `@telegram-apps/sdk`.

Sibling app for clinicians lives in `hospital-ai-doctors/` — separate repo, separate deploy.

---

## Stack

| Layer        | Choice                                              |
| ------------ | --------------------------------------------------- |
| Build        | Vite 8                                              |
| UI           | React 19 (+ React Compiler via `@vitejs/plugin-react`) |
| Styling      | Tailwind v4 (`@tailwindcss/vite`) + CSS vars        |
| Routing      | `react-router-dom` v7                               |
| Server state | `@tanstack/react-query` v5                          |
| Client state | `zustand` v5 (+ `persist` for auth/lang)            |
| HTTP         | `axios` + custom interceptors                       |
| AI Chat      | `fetch` streaming reader (SSE)                      |
| i18n         | `i18next` + `i18next-http-backend` (EN/RU/UZ)       |
| Icons        | `lucide-react`                                      |
| Toasts       | `react-toastify`                                    |
| Telegram     | `@telegram-apps/sdk`                                |

---

## Quick start

```bash
npm install
npm run dev       # vite on http://localhost:3002 (auto-opens browser)
npm run build     # tsc -b && vite build → dist/
npm run lint      # eslint .
npm run preview   # serve built dist
```

No test runner is configured.

### Environment

Create `.env.local` if you need to override defaults:

```
VITE_API_URL=https://api.hospital-ai.uz/api/v1
VITE_USE_MOCKS=false
```

- `VITE_API_URL` — backend base (defaults to production API).
- `VITE_USE_MOCKS` — kept as a flag for legacy mock data in `src/mocks/data.ts`. Pages currently hit the API directly; the flag is reserved.

---

## How the app works

### Boot flow

1. `src/main.tsx` mounts `<App />`, imports `./i18n` (which boots i18next), and clears any stale `lang` value from localStorage so language always re-reads from the store on load.
2. `src/App.tsx` composes one `QueryClient`, the `ToastContainer`, `BrowserRouter`, and a `PatientGuard` that reads `token` from `usePatientAuth`.
3. If `token` is missing → redirect to `/login`. Otherwise render `<PatientLayout />` with the page outlet inside.

### Routes

All authenticated routes live under one guarded layout:

| Path           | Page                  | Source                                  |
| -------------- | --------------------- | --------------------------------------- |
| `/login`       | Access code entry     | `pages/patient/PatientLoginPage.tsx`    |
| `/`            | Home / dashboard      | `pages/patient/HomePage.tsx`            |
| `/checklist`   | Daily care checklist  | `pages/patient/ChecklistPage.tsx`       |
| `/medications` | Meds + take buttons   | `pages/patient/MedicationsPage.tsx`     |
| `/diet`        | Diet guidance         | `pages/patient/DietPage.tsx`            |
| `/chat`        | AI nurse chat (SSE)   | `pages/patient/AIChatPage.tsx`          |
| `/checkin`     | Daily check-in form   | `pages/patient/CheckInPage.tsx`         |
| `/profile`     | Patient profile       | `pages/patient/ProfilePage.tsx`         |
| `/report`      | Anonymous report      | `pages/patient/AnonymousReportPage.tsx` |

Bottom nav lives in `layouts/PatientLayout.tsx`. On every `pathname` change the layout scrolls its `<main>` container to the top.

### Auth

Login posts `accessCode` (`HOSP-XXXX`) to `/auth/patient-login`. On success the response (`accessToken`, `user`, `patient`) is reduced into the Zustand store:

```ts
// src/stores/patientAuth.ts
{ token, fullName, patientId }
```

Persisted under localStorage key `patient-auth` (Zustand `persist` middleware). The axios request interceptor in `src/api/client.ts` reads that key and attaches `Authorization: Bearer <token>` on every request. A response interceptor wipes the store and redirects to `/login` on `401`.

### Data layer

All server data goes through TanStack Query hooks in `src/api/hooks.ts`:

| Hook                          | Endpoint                                |
| ----------------------------- | --------------------------------------- |
| `useDashboard()`              | `GET /me/dashboard`                     |
| `useChecklist(date?)`         | `GET /me/checklist?date=`               |
| `useCompleteChecklistItem()`  | `PATCH /me/checklist/items/:id/complete`|
| `useMedications(date?)`       | `GET /me/medications?date=`             |
| `useMarkMedicationTaken()`    | `PATCH /me/medications/:id/taken`       |
| `useDiet()`                   | `GET /me/diet`                          |
| `usePatientProfile()`         | `GET /me/profile`                       |
| `useCheckInMutation()`        | `POST /me/check-in`                     |
| `useChatHistory()`            | `GET /me/chat/history`                  |
| `usePatientLogin()`           | `POST /auth/patient-login`              |
| `streamChat(messages, onDelta)` | `POST /me/chat` (SSE, raw `fetch`)    |

Mutations invalidate the relevant `['me', ...]` query keys so the dashboard, checklist, and medications cards stay in sync without manual refetch wiring.

### Loading + error UX

Every data-driven page renders one of three states:

1. **Loading** — a layout-matching skeleton (`src/components/Skeleton.tsx` shimmer primitive + per-page skeleton component).
2. **Error** — `<ErrorState onRetry={refetch} />` (`src/components/ErrorState.tsx`).
3. **Success** — actual data.

`SkeletonStyles` is injected once at the layout level so the shimmer keyframes are available everywhere.

### AI chat (streaming)

`AIChatPage` does **not** use TanStack Query for the live stream. It calls `streamChat()` (in `src/api/hooks.ts`), which uses `fetch` to POST `/me/chat`, then walks the SSE byte stream:

```
data: {"delta":"You"}
data: {"delta":" should"}
data: {"done":true,"modelUsed":"openai/gpt-5.4-mini"}
```

Each `delta` is appended to the in-flight assistant bubble for a typing effect. Past turns are hydrated via `useChatHistory()`.

### i18n

`src/i18n.ts` initialises i18next with `i18next-http-backend` loading `/i18n/{{lng}}/translation.json` from `public/i18n/`. Languages: `en`, `ru`, `uz`. To add a key, edit all three JSON files. The `LanguageSwitcher` component (segmented pill) drives `langStore`, which mirrors into i18next.

### Theme

Brand palette is defined as CSS variables in `src/index.css`:

- `--navy` `#0A1628` — primary brand colour (also assigned to `--teal` for legacy compatibility).
- `#0EA5E9` — bright sky accent used in gradients, on-navy text, and active states.
- Surface / border / text tokens are CSS vars too.

The Poppins font is loaded via Google Fonts. The scrollbar is custom-themed in `src/index.css` (thin, sky-blue gradient).

---

## Project structure

```
hospital-ai-patients/
├── public/
│   └── i18n/{en,ru,uz}/translation.json   # static translation bundles
├── src/
│   ├── api/
│   │   ├── client.ts       # axios instance, interceptors, getPatientToken()
│   │   └── hooks.ts        # all TanStack Query hooks + streamChat()
│   ├── components/
│   │   ├── ErrorState.tsx  # retryable error card
│   │   ├── LanguageSwitcher.tsx
│   │   └── Skeleton.tsx    # shimmer primitive + global keyframes
│   ├── layouts/
│   │   └── PatientLayout.tsx   # bottom nav, scroll restore, skeleton styles
│   ├── mocks/
│   │   └── data.ts         # legacy fixtures (unused by current pages)
│   ├── pages/
│   │   └── patient/        # one .tsx per route
│   ├── stores/
│   │   ├── langStore.ts
│   │   └── patientAuth.ts  # persisted: token, fullName, patientId
│   ├── types/
│   │   └── index.ts        # legacy mock-shape types
│   ├── App.tsx             # router + guards + providers
│   ├── i18n.ts
│   ├── index.css           # CSS vars, font, scrollbar
│   └── main.tsx
├── CLAUDE.md               # guidance for Claude Code
├── vercel.json             # SPA rewrite to /index.html
└── package.json
```

---

## Deployment

Deploy on Vercel as a single project rooted at this directory. `vercel.json` rewrites every path to `/index.html` so React Router handles deep links. Set `VITE_API_URL` in the project's environment variables if the backend isn't on the default host.
