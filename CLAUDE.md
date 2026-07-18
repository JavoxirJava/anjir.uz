# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Project Overview

**I-Imkon.uz** — an inclusive education platform for grades 5–9 in Uzbekistan. It serves four roles: `super_admin`, `director`, `teacher`, and `student`. Accessibility (WCAG 2.1 AA) is the top priority — every component must be keyboard-navigable, screen-reader-compatible, and support color-blind modes.

## Commands

### Frontend (Next.js 16 + React 19)
```bash
npm run dev      # Start dev server (port 3000)
npm run build    # Production build
npm run lint     # ESLint check
```

### Backend (Express + Node.js, `server/`)
```bash
npm --prefix server run dev           # Start backend in watch mode (port 4000)
npm --prefix server run build         # Compile TypeScript → dist/
npm --prefix server run start         # Run compiled backend
npm --prefix server run db:migrate:dev  # Run DB migrations (dev, via tsx)
npm --prefix server run db:migrate    # Run DB migrations (prod, via node dist/)
```

No test runner is configured yet.

## Environment Variables

No `.env.example` exists; required vars are only discoverable by grepping `process.env`. Frontend (`.env.local`):
- `NEXT_PUBLIC_API_URL` — backend URL (defaults to `http://localhost:4000`)
- `CLOUDFLARE_R2_ACCOUNT_ID`, `CLOUDFLARE_R2_ACCESS_KEY_ID`, `CLOUDFLARE_R2_SECRET_ACCESS_KEY`, `CLOUDFLARE_R2_BUCKET_NAME`, `CLOUDFLARE_R2_PUBLIC_URL` — R2 storage (`lib/storage/r2.ts`)
- `CLOUDFLARE_STREAM_TOKEN` — video upload (`lib/storage/stream.ts`)
- `OPENAI_API_KEY` — Whisper subtitle generation (`/api/whisper`)
- `GEMINI_API_KEY` (falls back to `GOOGLE_GEMINI_API_KEY`, then `GOOGLE_API_KEY`), `GEMINI_MODEL` (defaults to `gemini-1.5-flash`) — `/api/ai/assignment-chat`

Backend (`server/.env`):
- `DATABASE_URL` — PostgreSQL connection string
- `JWT_SECRET`, `JWT_REFRESH_SECRET`, `JWT_EXPIRES_IN`, `JWT_REFRESH_EXPIRES_IN` — auth tokens
- `PORT` — defaults to `4000`
- `FRONTEND_URL` — Socket.io CORS origin (defaults to `http://localhost:3000`)

## Architecture

### Two-Process Setup

The project is **two separate processes**:
1. **Frontend** — Next.js app at `localhost:3000` (`NEXT_PUBLIC_API_URL`)
2. **Backend** — Express + PostgreSQL at `localhost:4000` (`server/`)

Both must be running in development. The frontend never queries the DB directly — all data flows through the backend REST API.

### Route Structure (App Router)

Role-based top-level routes map to user roles after login:

| Route | Role |
|-------|------|
| `/app/` | student |
| `/teacher/` | teacher |
| `/director/` | director |
| `/admin/` | super_admin |
| `/parent/` | parent |
| `/login`, `/register`, `/onboarding`, `/pending` | unauthenticated/new users |

After login, `app/actions/auth.ts` reads the user's role and redirects accordingly. Users with `status: "pending"` or `"rejected"` are held at `/pending`.

### Auth

JWT-based, phone-number login. Two cookies set by `lib/api/auth.ts`:
- `anjir_at` — access token (non-httpOnly, 8h) — readable by both server and browser
- `anjir_rt` — refresh token (httpOnly, 30d)

**Middleware** (`middleware.ts`) decodes JWT locally (no network call) — used only for routing. Real auth is enforced in each role's `layout.tsx` via `getCurrentUser()`, which calls `/auth/me`. `getCurrentUser()` is wrapped with React `cache()` so layout + page + metadata share one `/auth/me` request per render. Backend validates JWT in `server/src/middleware/auth.ts`.

### API Clients

All frontend↔backend communication goes through:
- **`lib/api/server.ts`** — server-side fetcher (`apiFetch`, `apiGet`, `apiPost`, `apiPut`, `apiDelete`). Reads `anjir_at` from `cookies()`. Throws `ApiError` with HTTP status. 10s timeout.
- **`lib/api/browser.ts`** — browser-side fetcher (same API shape). Reads `anjir_at` from `document.cookie`.
- **`lib/api/[domain].ts`** — domain-specific typed wrappers (`books.ts`, `games.ts`, `lectures.ts`, etc.) used in Server Components.

`lib/db/*.ts` files are legacy shim re-exports — they just re-export from `lib/api/`.

### Server Actions

All mutations live in `app/actions/`. They are `"use server"` functions, accept `FormData`, validate with Zod schemas from `lib/validations/`, and call the backend via `lib/api/server.ts`. Return `{ error: string }` on failure or redirect on success.

### Next.js API Route Handlers (`app/api/`)

These are Next.js Route Handlers (not server actions) for operations that can't go through the Express backend:
- `POST /api/upload` — proxies file upload to R2 (avoids CORS and Netlify body-size limits)
- `POST /api/upload/presign` — returns presigned R2 URL for direct browser upload
- `POST /api/upload/stream` — creates a Cloudflare Stream direct upload URL for video
- `POST /api/whisper` — calls OpenAI Whisper to generate VTT subtitles, saves to R2
- `POST /api/ai/assignment-chat` — Gemini-only chat assistant that helps a teacher draft an assignment (title/description/deadline); teacher/super_admin only

PDF-to-speech text extraction is a backend endpoint instead (`POST /lectures/pdf-text`, used by `components/lectures/PdfReadAloudButton.tsx`) — not a Next.js route.

### Backend Structure (`server/src/`)

- `app.ts` — Express app: helmet, cors, JSON body limit (2mb), structured request logging (`utils/logger.ts`); no rate-limiting is configured
- `index.ts` — HTTP server + Socket.io setup
- `db/pool.ts` — `pg` Pool (reads `DATABASE_URL`)
- `db/migrate.ts` — runs `db/schema.sql`
- `routes/` — one file per domain, mounted in `app.ts`
- `middleware/auth.ts` — JWT verification; attaches `req.user`
- `middleware/role.ts` — role-based access guard
- `socket/` — Socket.io real-time events (parent↔teacher chat)
- `utils/asyncHandler.ts` — `ah()` wrapper; use it for all async route handlers to forward thrown errors to Express error middleware

### Types

- **`lib/types/domain.ts`** — shared frontend types (`UserRole`, `UserStatus`, `ContrastMode`, `ColorBlindMode`, `FontSize`)
- **`lib/api/[domain].ts`** — domain-specific row types (e.g., `AssignmentRow`, `LectureRow`)
- **`server/src/types/index.ts`** — backend-only types (`AuthRequest`, `JwtPayload`)

### Content Model: Subjects vs. Topics

`subjects` (e.g. "Matematika") and `topics` (e.g. "Kasrlar") are separate tables — each topic belongs to one subject via `topics.subject_id`. `lectures`, `assignments`, `tests`, and `games` all reference `topic_id`; **none of them have a `subject_id` column**. To filter or join content by subject, join through `topics`. This split replaced an older flat model where content linked to subjects directly — `server/src/db/migration_topics.sql` is the one-time production migration that moved existing rows (already applied; not run by any script).

### Assignment Difficulty (Temporarily Disabled)

Assignment difficulty selection, level-based student filtering, and automatic student-level updates are disabled. Students see every assignment attached to their class. The legacy `assignments.difficulty_level`, `student_profiles.difficulty_level`, and `student_profiles.level_progress_score` columns remain in the schema only for backward compatibility and a possible future re-enable; active code must not read or update them.

### Migrations

SQL schema lives in `server/src/db/schema.sql`. Run via `npm --prefix server run db:migrate:dev`. Most `CREATE TABLE` statements have no `IF NOT EXISTS` guard, so this is meant to bootstrap a fresh database, not to run again against one that already has tables — re-running it will error. For incremental schema changes against an existing database, either apply a hand-written `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` directly, or follow the pattern in `assignments.ts` (`ensureAssignmentLinkColumn()`) of lazily running a guarded `ALTER`/`CREATE ... IF NOT EXISTS` at request time. The legacy `supabase/migrations/` directory contains historical SQL for reference only — the project no longer uses Supabase.

### File Storage

- **Cloudflare R2** — PDFs, audio, and other static files (`lib/storage/r2.ts`). Upload via `/api/upload` or presigned URL via `/api/upload/presign`.
- **Cloudflare Stream** — video lectures (`lib/storage/stream.ts`). Upload via `/api/upload/stream`.
- Remote image patterns are whitelisted in `next.config.ts`.

### Accessibility System

`components/providers/AccessibilityProvider.tsx` persists settings to `localStorage` under the key `anjir_a11y` and applies them as `data-*` attributes on `<html>`:
- `data-font-size` — `small | medium | large | xlarge`
- `data-contrast` — `normal | high | dark` (dark also toggles `.dark` class)
- `data-color-blind` — `normal | protanopia | deuteranopia | tritanopia`
- `data-reduce-motion` — present (`"true"`) only when reduced motion is on, otherwise absent (presence/absence, not a 3-value enum like the others)

SVG color-blind filters are defined once in the root layout. Use `useAccessibility()` hook to read/write settings.

## Key Conventions

- **All UI strings are in Uzbek** (Latin script). Never hardcode strings — use `lib/strings/uz.ts`.
- **No `any` types.** Domain types live in `lib/types/domain.ts` and `lib/api/`.
- **Zod versions differ**: frontend uses Zod v4 (`lib/validations/`), backend uses Zod v3 (`server/`). APIs changed between versions — don't copy validation schemas across the boundary without checking.
- **Forms** use React Hook Form + Zod. Validation schemas live in `lib/validations/`.
- **Toast notifications** use `sonner` via `components/ui/sonner.tsx`. Import `toast` from `sonner`.
- **Client state** uses Zustand where needed.
- **Grading scale is 5/4/3** (no 2/1): `scoreGrade()` in `lib/utils.ts` maps a score percentage to `A'lo` (≥86 → 5), `Yaxshi` (≥65 → 4), `Qoniqarli` (≥30 → 3), or `Qoniqarsiz` (below 30 → no numeric grade). Scores can be floats — use `formatScore()` to display them, not raw `.toFixed()`.
- **Every interactive element** must be keyboard accessible and have visible focus indicators (2px outline). Never convey information through color alone.
- **After backend changes**, rebuild with `npm --prefix server run build` — the running process uses `dist/`.
