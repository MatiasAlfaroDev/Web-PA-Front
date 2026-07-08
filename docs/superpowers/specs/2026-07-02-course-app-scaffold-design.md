# Course App — Basic Project Layout (Scaffold)

**Date:** 2026-07-02
**Scope:** Initial frontend scaffold only. Feature implementations (auth flow, challenge runner) are separate designs.

## Concept

A school course app in the spirit of AdventJS: structured **courses** that contain
**challenges**, where challenges involve running/checking code. Two user roles:
students (consume courses, solve challenges) and teachers/admins (create/manage courses).

The backend lives in a **separate repository**; this app is a frontend that talks to
it over HTTP.

## Stack

- **React Router v7** in framework mode + **Vite**, TypeScript
- **shadcn/ui** + Tailwind CSS
- Thin API client pointing at the backend via an env var (`VITE_API_URL` / RR equivalent)
- No state library and no test setup yet — React Router loaders/actions cover data
  fetching; both get added when real logic needs them.

## Route structure

```
/                     landing / redirect to /app
/login

/app                  student area (layout: nav + auth guard)
  /app/courses          course list
  /app/courses/:id      course detail (lessons + challenges)
  /app/challenges/:id   challenge view (solve/submit, runs code)

/admin                teacher/admin area (layout: guard, role = teacher)
  /admin/courses        manage courses
  /admin/courses/:id    edit course + its challenges
```

## Folder layout

```
app/
  root.tsx                 app shell
  routes.ts                route config
  routes/                  route modules mirroring the tree above
  components/ui/           shadcn components
  components/              shared app components
  lib/
    api.ts                 fetch wrapper (base URL, auth header, error handling)
    auth.ts                current-user / role helpers (stub until backend exists)
  styles/app.css           tailwind entry
```

## Deliberately skipped (add when needed)

- **Real auth flow / token storage** — `auth.ts` is a stub; wire to backend when the API exists.
- **State management library** — loaders/actions until they demonstrably fall short.
- **Test setup** — add with the first piece of real logic.
- **Challenge runner** (code execution/checking) — its own design; the scaffold only
  reserves the `/app/challenges/:id` route.

## Success criteria for this scaffold

- `npm run dev` serves the app with all routes above resolving (placeholder content).
- shadcn/ui installed and one component renders to prove the pipeline.
- Student and admin layouts exist with their guard stubs in place.
- API client and auth helpers exist as stubs with clear interfaces.
