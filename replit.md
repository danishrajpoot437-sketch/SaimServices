# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Artifacts

### SaimServices Utility Hub (`artifacts/saim-hub`)
- **Type**: React + Vite SPA
- **Preview Path**: `/`
- **Stack**: React, Tailwind CSS, Framer Motion, Lucide Icons, mathjs, Recharts, @tanstack/react-query, wouter
- **Design**: Permanent dark mode, glassmorphism, Electric Blue + Gold accents
- **Routing**: wouter v3 — routes: `/`, `/blog`, `/blog/:slug`, `/admin`
- **Modules**:
  - **Engineering Suite (10 tabs)**: Unit Pro, Materials Finder, Function Grapher, Eng. Constants, Math Solver, Stat Suite, Graphlab, Periodic Table, Beam Analyst, Dev Kit
  - **Academic Hub (5 tabs)**: Study Guides, GPA Converter, Tracker, Citations, Research Finder
  - **Content Powerhouse**: File Converter, Content Analyzer
  - **News Feed**: Curated news
  - **Blog (`/blog`)**: Public blog listing + article detail pages
  - **Admin (`/admin`)**: Password-protected blog management — create/edit/delete/schedule posts
- **Components**: Modular architecture in `src/components/` with subdirectories per module

### API Server (`artifacts/api-server`)
- Express 5 API server
- Health check at `/api/healthz`
- **Blog API**: `GET /api/blogs`, `GET /api/blogs/:slug` (public)
- **Admin API**: `POST /api/admin/login`, `POST /api/admin/logout`, `GET/POST/PUT/DELETE /api/admin/blogs/*` (auth required)
- **Admin Auth**: Bearer token sessions (24h TTL, in-memory); password from `ADMIN_PASSWORD` env var (default: `SaimAdmin2025`)

### Database (`lib/db`)
- PostgreSQL via `@workspace/db` (Drizzle ORM)
- Schema: `blogsTable` — id, title, slug, excerpt, content, category, tags, coverImage, author, status (draft/published/scheduled), readTime, scheduledAt, publishedAt, createdAt, updatedAt
- Slug auto-generated from title + timestamp suffix (e.g. `getting-started-with-beam-analysis-mnubp7by`)
- Tags stored as PostgreSQL text[] when sent as JSON array; frontend uses `parseTags()` helper in BlogList.tsx and BlogPost.tsx to handle both `{a,b}` PG array and `a,b` CSV formats

## Auth System (localStorage-based)
- **Context**: `artifacts/saim-hub/src/context/AuthContext.tsx` — React context with `useAuth()` hook
- **Storage**: Users stored in `localStorage` as JSON under `saim_users_v1`; session under `saim_session_v1`
- **Modal**: `AuthModal.tsx` — tabbed Sign In / Sign Up with password strength indicator, error states, success animation
- **Navbar integration**: Shows user avatar (gradient circle + initials) when signed in; dropdown with Sign Out; mobile menu shows user info + sign-out button
- **No backend auth** — purely client-side (no JWT, no backend routes needed for this feature)

## Bug Fixes (April 2026 QA Pass)

### Math Solver (`MathSolver.tsx`)
1. **Variable detection regex**: `[a-df-wyz]` → `[a-df-z]` — the old range accidentally excluded 'x' (the most common variable). Equations like "6x + 5 = 14" were misdetected as "evaluate" type and crashed when mathjs saw the `=` operator.
2. **Derivative parsing**: Rewrote expression extraction using `stripOuterParens()` instead of a fragile regex with `[\(\[]?(.+?)[\)\]]?$`. The old regex stripped the closing `)` of `cos(x)` in `d/dx(x^2 * cos(x))`, producing invalid `"x^2 * cos(x"`.
3. **Exponential detection**: Updated regex from `[a-df-wyz]` to `[a-df-z]` for consistency.

### Blog (`BlogList.tsx`, `BlogPost.tsx`)
- Added `parseTags()` helper that handles both PostgreSQL array format `{"a","b","c"}` and comma-separated `a,b,c` — previously tags sent as JSON arrays showed as `{"research"}` in the UI.

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally
- `pnpm --filter @workspace/saim-hub run dev` — run SaimServices hub locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
