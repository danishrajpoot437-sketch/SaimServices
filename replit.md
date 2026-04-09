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
- **Stack**: React, Tailwind CSS, Framer Motion, Lucide Icons, mathjs
- **Design**: Premium dark mode (Deep Indigo #1a1a2e), glassmorphism, Electric Blue + Gold accents
- **Modules**:
  - **Engineering Suite**: Scientific Calculator (mathjs), Unit Converter (6 categories), Beam Deflection Calculator (UI preview)
  - **Academic Hub**: Study Guides (USA/Europe/Scholarships/Visa), CGPA Converter (Pakistan/India/USA), University Application Tracker (localStorage)
  - **Content Powerhouse**: Word→PDF UI, Case Converter, Character Counter (keyword density)
  - **News Feed**: Dummy JSON cards (AI/Tech/Education), filterable categories
- **Components**: Modular architecture in `src/components/` with subdirectories per module

### API Server (`artifacts/api-server`)
- Express 5 API server
- Health check at `/api/healthz`

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
