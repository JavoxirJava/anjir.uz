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
- `POST /api/ai` — AI content generation (OpenAI/Gemini)
- `POST /api/pdf-text` — extracts text from PDF for processing

### Backend Structure (`server/src/`)

- `app.ts` — Express app with helmet, cors, rate-limiting
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

### Migrations

SQL schema lives in `server/src/db/schema.sql`. Run via `npm --prefix server run db:migrate:dev`. The legacy `supabase/migrations/` directory contains historical SQL for reference only — the project no longer uses Supabase.

### File Storage

- **Cloudflare R2** — PDFs, audio, and other static files (`lib/storage/r2.ts`). Upload via `/api/upload` or presigned URL via `/api/upload/presign`.
- **Cloudflare Stream** — video lectures (`lib/storage/stream.ts`). Upload via `/api/upload/stream`.
- Remote image patterns are whitelisted in `next.config.ts`.

### Accessibility System

`components/providers/AccessibilityProvider.tsx` persists settings to `localStorage` under the key `anjir_a11y` and applies them as `data-*` attributes on `<html>`:
- `data-font-size` — `small | medium | large | xlarge`
- `data-contrast` — `normal | high | dark` (dark also toggles `.dark` class)
- `data-color-blind` — `normal | protanopia | deuteranopia | tritanopia`

SVG color-blind filters are defined once in the root layout. Use `useAccessibility()` hook to read/write settings.

## Key Conventions

- **All UI strings are in Uzbek** (Latin script). Never hardcode strings — use `lib/strings/uz.ts`.
- **No `any` types.** Domain types live in `lib/types/domain.ts` and `lib/api/`.
- **Zod versions differ**: frontend uses Zod v4 (`lib/validations/`), backend uses Zod v3 (`server/`). APIs changed between versions — don't copy validation schemas across the boundary without checking.
- **Forms** use React Hook Form + Zod. Validation schemas live in `lib/validations/`.
- **Toast notifications** use `sonner` via `components/ui/sonner.tsx`. Import `toast` from `sonner`.
- **Client state** uses Zustand where needed.
- **Every interactive element** must be keyboard accessible and have visible focus indicators (2px outline). Never convey information through color alone.
- **After backend changes**, rebuild with `npm --prefix server run build` — the running process uses `dist/`.
