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

### Canvas (`artifacts/mockup-sandbox`)
- Design mockup sandbox

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally
- `pnpm --filter @workspace/saim-hub run dev` — run SaimServices hub locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
