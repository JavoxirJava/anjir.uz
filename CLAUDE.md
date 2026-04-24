# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Project Overview

**I-Imkon.uz** — an inclusive education platform for grades 5–9 in Uzbekistan. It serves four roles: `super_admin`, `director`, `teacher`, and `student`. Accessibility (WCAG 2.1 AA) is the top priority — every component must be keyboard-navigable, screen-reader-compatible, and support color-blind modes.

## Commands

```bash
npm run dev      # Start dev server
npm run build    # Production build
npm run lint     # ESLint check
```

No test runner is configured yet.

## Architecture

### Route Structure (App Router)

Role-based top-level routes map to user roles after login:

| Route | Role |
|-------|------|
| `/app/` | student |
| `/teacher/` | teacher |
| `/director/` | director |
| `/admin/` | super_admin |
| `/login`, `/register`, `/onboarding`, `/pending` | unauthenticated/new users |

After login, `app/actions/auth.ts` reads the user's role from `public.users` and redirects accordingly. Users with `status: "pending"` or `"rejected"` are held at `/pending`.

### Data Layer

- **`lib/supabase/server.ts`** — server-side Supabase client (uses cookies, for Server Components and Server Actions)
- **`lib/supabase/client.ts`** — browser-side Supabase client
- **`lib/supabase/admin.ts`** — service-role client that bypasses RLS (for Server Actions only)
- **`lib/supabase/middleware.ts`** — refreshes sessions in middleware
- **`lib/db/`** — query helpers grouped by domain (`books.ts`, `games.ts`, `lectures.ts`, etc.). All use `createAdminClient()` since they run server-side.
- **`lib/supabase/types.ts`** — hand-written TypeScript types for all DB tables/enums. Run `supabase gen types` to regenerate when schema changes.

### Server Actions

All mutations live in `app/actions/`. They are `"use server"` functions, accept `FormData`, validate with Zod schemas from `lib/validations/`, and return `{ error: string }` on failure or redirect on success.

### Migrations

SQL migrations are in `supabase/migrations/` with the naming convention `YYYYMMDD_NNN_description.sql`. Apply them via Supabase MCP (`mcp__claude_ai_Supabase__apply_migration`) or directly in Supabase Studio. The file `supabase/apply_migration_003.sql` is a pending migration script.

### File Storage

- **Cloudflare R2** — PDFs, audio, and other static files (`lib/storage/r2.ts`)
- **Cloudflare Stream** — video lectures (`lib/storage/stream.ts`)
- Remote image patterns are whitelisted in `next.config.ts`

### Accessibility System

`components/providers/AccessibilityProvider.tsx` persists settings to `localStorage` under the key `anjir_a11y` and applies them as `data-*` attributes on `<html>`:
- `data-font-size` — `small | medium | large | xlarge`
- `data-contrast` — `normal | high | dark` (dark also toggles `.dark` class)
- `data-color-blind` — `normal | protanopia | deuteranopia | tritanopia`

SVG color-blind filters are defined once in the root layout. Use `useAccessibility()` hook to read/write settings.

## Key Conventions

- **All UI strings are in Uzbek** (Latin script). Never hardcode strings — use `lib/strings/uz.ts`.
- **No `any` types.** Types are in `lib/supabase/types.ts`.
- **Auth uses phone numbers** mapped to synthetic emails: `{phone}@anjir.internal`. This is how Supabase Auth is configured.
- **Forms** use React Hook Form + Zod. Validation schemas live in `lib/validations/`.
- **Toast notifications** use `sonner` via `components/ui/sonner.tsx`. Import `toast` from `sonner`.
- **Every interactive element** must be keyboard accessible and have visible focus indicators (2px outline). Never convey information through color alone.
