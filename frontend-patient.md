# Frontend Integration — PATIENT app

> For the Claude Code instance wiring the **patient mobile app** to the API.
> Stack: **React + TanStack Query + axios**. Base URL: **`https://api.hospital-ai.uz/api/v1`** (local dev: `http://localhost:3000/api/v1`).

---

## 0. Shared setup (do this first)

```ts
// src/api/client.ts
import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'https://api.hospital-ai.uz/api/v1',
});

api.interceptors.request.use((cfg) => {
  const token = localStorage.getItem('patientToken');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});
```

```ts
// src/main.tsx — wrap the app
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
const queryClient = new QueryClient();
// <QueryClientProvider client={queryClient}> ... </QueryClientProvider>
```

Auth model: patients log in with a **6–8 char access code** (e.g. `HOSP-1235`). The returned `accessToken` is stored and sent as `Authorization: Bearer <token>` on every call. There are no cookies.

---

## 1. Login (access code)

**POST `/auth/patient-login`**

Request:
```json
{ "accessCode": "HOSP-1235" }
```
Response:
```json
{
  "accessToken": "eyJhbGci...",
  "user": { "id": "uuid", "fullName": "Bobur Toshmatov", "email": "bobur@mail.ru", "role": "PATIENT", "hospitalId": "uuid" },
  "patient": { "id": "uuid", "publicId": "PX-1001", "status": "AT_RISK", "accessCode": "HOSP-1235", "...": "..." }
}
```

UI: access-code entry screen → on success store `accessToken` (and `patient.id` if you want) → route to Home.

```ts
const login = useMutation({
  mutationFn: (accessCode: string) =>
    api.post('/auth/patient-login', { accessCode }).then(r => r.data),
  onSuccess: (d) => { localStorage.setItem('patientToken', d.accessToken); /* navigate */ },
});
```

Demo codes: `HOSP-1235` (Bobur, appendectomy, at-risk) · `HOSP-1234` (Nodira).

---

## 2. Home / Dashboard  (screenshot: "Good Morning, …")

**GET `/me/dashboard`**

Response:
```json
{
  "patient": { "id": "uuid", "fullName": "Bobur Toshmatov", "status": "AT_RISK", "recoveryScore": 42 },
  "recovery": { "postOpDay": 4, "totalDays": 21, "progressPct": 19 },
  "todaySchedule": [
    { "itemId": "uuid", "type": "MEDICATION", "title": "Ibuprofen 400mg", "description": "Take with food...", "scheduleTime": "08:00", "dosage": "400mg", "frequency": "2x daily", "completed": false }
  ],
  "weeklyVitality": { "latestPain": 7, "painTrend": [ { "date": "2026-06-01", "pain": 6 } ] }
}
```

UI mapping:
- Header greeting = `patient.fullName`.
- Big progress card = `recovery.postOpDay` "Days" + `recovery.progressPct` "% of your recovery journey".
- "Today's Schedule" list = `todaySchedule` (icon by `type`: MEDICATION=pill, EXERCISE=activity, DIET=leaf, RESTRICTION=ban). Show `title` + `description`; for meds show `scheduleTime`.
- "Weekly Vitality" pain stat = `weeklyVitality.latestPain` `/10`; sparkline from `painTrend`.
- "Daily Check-in" button → opens the check-in flow (section 7).

```ts
const useDashboard = () => useQuery({ queryKey: ['me','dashboard'], queryFn: () => api.get('/me/dashboard').then(r=>r.data) });
```

---

## 3. Checklist  (screenshot: "Today's Checklist 1 of 5")

**GET `/me/checklist?date=YYYY-MM-DD`** (omit `date` for today)

Response:
```json
{
  "date": "2026-06-05",
  "completed": 1,
  "total": 5,
  "items": [
    { "itemId": "uuid", "type": "MEDICATION", "title": "Ibuprofen 400mg", "description": "Take with food", "scheduleTime": "08:00", "dosage": "400mg", "completed": true },
    { "itemId": "uuid", "type": "RESTRICTION", "title": "No weight bearing", "description": "Use crutches...", "scheduleTime": "", "completed": false }
  ]
}
```

UI: progress bar = `completed/total`. Each row: checkbox (from `completed`), title, description, time (if `scheduleTime`). Tapping the checkbox calls the complete mutation below. Note: an item can appear multiple times (one per `scheduleTime`); the `(itemId, scheduleTime)` pair is the unique key.

**PATCH `/me/checklist/items/:itemId/complete`**
```json
{ "scheduleTime": "08:00", "completed": true }
```
Response: `{ "itemId": "uuid", "date": "2026-06-05", "scheduleTime": "08:00", "completed": true }`

```ts
const useChecklist = (date?: string) =>
  useQuery({ queryKey: ['me','checklist',date], queryFn: () => api.get('/me/checklist', { params: { date } }).then(r=>r.data) });

const useComplete = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { itemId: string; scheduleTime: string; completed: boolean }) =>
      api.patch(`/me/checklist/items/${v.itemId}/complete`, { scheduleTime: v.scheduleTime, completed: v.completed }).then(r=>r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['me','checklist'] }); qc.invalidateQueries({ queryKey: ['me','dashboard'] }); },
  });
};
```

---

## 4. Medications  (screenshot: "Your Medications 0 of 2")

**GET `/me/medications?date=`** → same shape as checklist but only MEDICATION items, key `medications`:
```json
{ "date":"2026-06-05", "completed":0, "total":2,
  "medications":[ { "itemId":"uuid","title":"Ibuprofen 400mg","dosage":"400mg","frequency":"2x daily","scheduleTime":"08:00","description":"...","completed":false } ] }
```
UI: "X of N completed today" header + a row per dose with time, name, dosage; lock/check icon from `completed`.

**PATCH `/me/medications/:itemId/taken`** — body/response identical to the checklist-complete endpoint (it's the same completion mechanism).

---

## 5. Diet  (screenshot: "Diet Guidance")

**GET `/me/diet`**
```json
{
  "prescribed": [ { "title": "High protein diet", "description": "Aim for 1.2g protein per kg..." } ],
  "tips": [
    { "icon": "protein", "title": "High Protein", "text": "Chicken, fish, eggs, legumes..." },
    { "icon": "leaf", "title": "Anti-inflammatory", "text": "Broccoli, berries..." },
    { "icon": "water", "title": "Hydration", "text": "8–10 glasses of water daily..." },
    { "icon": "avoid", "title": "Avoid", "text": "Alcohol, processed foods, excess sodium." }
  ]
}
```
UI: "Prescribed" card(s) from `prescribed`; "Recovery Nutrition Tips" grid from `tips` (map `icon` → your icon set).

---

## 6. Profile  (screenshot: "Verified Patient")

**GET `/me/profile`**
```json
{
  "id":"uuid","publicId":"PX-1001","fullName":"Bobur Toshmatov","email":"bobur@mail.ru","phone":"+998901112233",
  "age":43,"status":"AT_RISK","accessCode":"HOSP-1235",
  "surgery": { "type":"Appendectomy","date":"2026-06-01","postOpDay":4,"totalDays":21,"progressPct":19 }
}
```
UI: avatar (initials from `fullName`), "VERIFIED PATIENT" badge, recovery progress bar (`surgery.postOpDay / surgery.totalDays`, `progressPct`%), rows: Surgery (`surgery.type`), Surgery Date (`surgery.date`), Access Code (`accessCode`), Email, Phone.

---

## 7. Daily Check-in → AI risk

**POST `/me/check-in`**
```json
{ "painLevel": 7, "temperature": 38.5, "symptoms": ["wound redness","chills"], "mood": "anxious", "bpm": 98, "spo2": 96 }
```
Response:
```json
{
  "checkIn": { "id":"uuid", "date":"2026-06-05", "painLevel":7 },
  "risk": { "riskLevel":"HIGH", "advice":"Your symptoms may indicate...", "confidence":0.98, "recoveryScore":35, "alertCreated":true, "modelUsed":"openai/gpt-5.4-mini", "fallbackUsed":false }
}
```
UI: a short form (pain slider 0–10 required; temperature, symptoms multi-select, mood, optional vitals). On submit show a **result card**: colored by `risk.riskLevel` (LOW=green, MEDIUM=amber, HIGH=red), show `risk.advice`, and if `risk.alertCreated` add "Your care team has been notified." Then invalidate dashboard/checklist queries (score + status changed).

```ts
const useCheckIn = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body) => api.post('/me/check-in', body).then(r=>r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['me'] }),
  });
};
```

---

## 8. AI Nurse Chat (STREAMING — special handling)

**POST `/me/chat`** returns **Server-Sent Events**, not JSON — do **not** use axios/TanStack Query for the stream. Use `fetch` + a stream reader.

Request body:
```json
{ "messages": [ { "role": "user", "content": "Can I take a bath on day 4?" } ] }
```
Stream frames (text/event-stream):
```
data: {"delta":"You"}
data: {"delta":" should"}
...
data: {"done":true,"modelUsed":"openai/gpt-5.4-mini"}
```

Reader:
```ts
export async function streamChat(messages, onDelta: (t: string) => void) {
  const res = await fetch(`${api.defaults.baseURL}/me/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('patientToken')}` },
    body: JSON.stringify({ messages }),
  });
  const reader = res.body!.getReader();
  const dec = new TextDecoder();
  let buf = '';
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    const lines = buf.split('\n\n'); buf = lines.pop() ?? '';
    for (const line of lines) {
      const m = line.replace(/^data: /, '').trim();
      if (!m) continue;
      const j = JSON.parse(m);
      if (j.delta) onDelta(j.delta);   // append token to the bubble
      if (j.done) return;
    }
  }
}
```
UI: chat thread; append `delta` tokens to the assistant bubble as they arrive (typing effect). The agent is trilingual (reply matches the user's language EN/RU/UZ), personalized (it reads the patient's plan + recent check-ins), and KB-grounded.

**GET `/me/chat/history`** → `[{ "input": "...", "output": "...", "createdAt": "..." }]` (use TanStack Query) to render past turns when the chat opens.

---

## Tasks (checklist)

- [ ] Add shared `api` axios client + `VITE_API_URL` env + QueryClientProvider.
- [ ] Access-code login screen → store `patientToken`; add a 401 interceptor → redirect to login.
- [ ] Home/Dashboard from `/me/dashboard`.
- [ ] Checklist from `/me/checklist` + complete mutation (optimistic optional).
- [ ] Medications from `/me/medications` + taken mutation.
- [ ] Diet from `/me/diet`.
- [ ] Profile from `/me/profile`.
- [ ] Daily check-in form → `/me/check-in`, render AI risk result, invalidate `['me']`.
- [ ] Streaming chat via `fetch` reader (section 8) + history via query.
- [ ] Loading skeletons + error toasts on every query.

## Prompts for the other Claude Code

> "Create `src/api/client.ts` with an axios instance (baseURL from `VITE_API_URL`, fallback `https://api.hospital-ai.uz/api/v1`) and a request interceptor adding `Authorization: Bearer ${localStorage.patientToken}`. Add a response interceptor that redirects to /login on 401. Wrap the app in a TanStack `QueryClientProvider`."

> "Build the Patient Home screen. Add `useDashboard()` calling GET `/me/dashboard`. Render the greeting from `patient.fullName`, a progress card from `recovery` (postOpDay + progressPct), the Today's Schedule list from `todaySchedule` (icon by `type`), and a pain sparkline from `weeklyVitality.painTrend`. Show a skeleton while loading."

> "Build the Checklist screen with `useChecklist(date)` (GET `/me/checklist`) and a `useComplete()` mutation (PATCH `/me/checklist/items/:itemId/complete` with `{scheduleTime, completed}`). The unique row key is `itemId + scheduleTime`. On toggle, optimistically flip `completed` and invalidate `['me','checklist']` and `['me','dashboard']`."

> "Implement the streaming nurse chat. Do NOT use axios for the stream. Use the `streamChat()` fetch-reader (parse `data: {delta}` SSE frames, stop on `{done:true}`) to append tokens to the assistant bubble live. Load past turns with a `useChatHistory()` query on GET `/me/chat/history`."

> "Build the Daily Check-in form (pain 0–10 required; temperature, symptoms[], mood, optional bpm/spo2). POST `/me/check-in`; render a result card colored by `risk.riskLevel` with `risk.advice`, and 'care team notified' if `risk.alertCreated`. Invalidate the `['me']` query tree on success."
