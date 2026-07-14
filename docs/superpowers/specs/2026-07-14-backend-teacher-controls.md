# Backend needs — teacher controls, scheduling, site lock, score decay, lessons tab

**Date:** 2026-07-14
**Scope:** Backend-only (separate Laravel repo). This lists the resources/endpoints/fields
the frontend needs added; no frontend work included here.

Grounded in the current API contract (`app/lib/mappers.ts`, `app/lib/api.ts`) — reusing
existing fields/patterns wherever they already cover the ask.

## 1. Enable/disable courses & challenges from the teacher panel

Challenges already have `published: boolean` (`ApiChallenge.published`, editable via
`PATCH /challenges/{id}`) — **nothing new needed here**, just surface a toggle in the
teacher UI.

Courses have **no** publish flag today (`course-form.tsx` confirms: "no course-level
publish state"). Add:

- `courses.published` (bool, default `true`)
- Accept it in `PATCH /courses/{id}`
- Student-facing `GET /courses` / `GET /courses/{id}` must filter/403 on `published: false`

## 2. Course/lesson availability windows (scheduling)

Add nullable datetime columns:

- `courses.available_from`, `courses.available_until`
- same pair on the new `lessons` table (§5)

Backend computes lock state server-side (frontend never does date math, per existing
`status` computed-on-server pattern for challenges). Outside the window →
course/lesson behaves as `locked` in the API response, same shape as today's
`ChallengeStatus`. Accept both fields in the course/lesson PATCH payloads.

## 3. Site-wide lock (block access for X time / until X time)

New tiny resource, not tied to a course:

- `GET /site-lock` → `{ locked_until: string|null }` — public-ish (any authenticated
  user needs to check this before rendering the app)
- `PUT /site-lock` (teacher only) → body `{ locked_until: string }` (ISO datetime) **or**
  `{ duration_minutes: number }` (backend converts to `locked_until = now + duration`)
- `DELETE /site-lock` (teacher only) — unlock immediately

Single row of state (a `site_lock_until` value, e.g. in a settings table), not a log —
no history needed. Frontend checks this once in the root/layout loader and shows a
"locked until HH:mm" screen; keep the response tiny.

## 4. Gradual point decay by completion order (with a floor)

Add to `challenges`:

- `points` — already exists, this is the max/first-solver score
- `min_points` (or `points_floor_pct`, pick whichever the scoring code finds simpler) —
  the floor decay cannot go below

Scoring change lives entirely server-side in `POST /challenges/{id}/submissions`:
on a passing submission, look up how many students have already solved this challenge,
apply a decay step per rank, clamp at `min_points`. `Submission.score` (already returned
today) just reflects the decayed value — no new field on the submission itself.

Expose `min_points` in the teacher challenge form payload (`save-challenge` intent in
`course-edit.tsx` already posts `points`; add `min_points` alongside it) and in
`GET /challenges/{id}` so the student UI can show "N pts (min M)" if wanted.

## 5. Lessons tab (theory materials) — groundwork only

`ApiCourse` already carries `lessons_count` in the frontend mapper (dead field today —
nothing populates it), so the resource is expected. Add:

- `lessons` table: `id, course_id, title, content (markdown text), position, published,
  available_from, available_until, timestamps`
- `GET /courses/{id}` → include `lessons_count` (make the existing field real) and
  optionally `lessons: []` when embedding is cheap
- `GET /courses/{id}/lessons`, `POST /courses/{id}/lessons`
- `GET /lessons/{id}`, `PATCH /lessons/{id}`, `DELETE /lessons/{id}`

No content-type engine, no attachments/uploads — plain markdown text field, same as
`challenges.statement` today. Add richer content (images, files) only when a lesson
actually needs one.

## Skipped (YAGNI unless asked)

- Per-challenge availability windows — only courses/lessons were requested.
- Site-lock history/audit log — single current-state value is enough.
- Configurable decay curve (linear vs exponential, step size) — ship linear
  `points - (solved_count_before * step)` clamped at `min_points`; add a curve picker
  only if teachers ask for one.
- Lesson attachments/rich media — plain markdown until a lesson needs more.
