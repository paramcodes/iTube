# AGENTS.md — Contributor & Agent Guidelines

## Verification Workflow

When performing changes in this repository, follow the conditional routing rules below:

- **Read-only queries & explanations:** Answer directly. Do not launch the app or run tests.
- **Documentation & configuration (`*.md`, configs):** Run linter/formatter only (`bun run check`).
- **Backend, Database & Core Services (`packages/db`, `packages/types`, `apps/api`):** Run automated test suites:
  ```bash
  bun test
  ```
  Do not launch the visual app for purely data or algorithm changes.
- **Visual UI & Interactive Surface (`packages/ui`, `apps/web`):** Drive live verification using `.agents/skills/verify-itube/SKILL.md` and the Playwright test suite:
  ```bash
  bun x playwright test e2e/itube-features.spec.ts
  ```

---

## Workspace Structure & Invariants
- Runtime: Bun 1.4+
- Monorepo package topology:
  - `apps/web`: Next.js 15 App Router + React 19 + Tailwind v4 + Clerk + Eden Treaty
  - `apps/api`: Elysia Bun server + Clerk backend + Upstash Redis & QStash + Mux
  - `packages/db`: Drizzle ORM + PostgreSQL schema + migrations
  - `packages/ui`: YouTube design tokens + Shadcn / Radix primitives
  - `packages/types`: Zod DTO contracts and shared codecs
  - `packages/config`: Shared Biome 1.9 config and base tsconfig
- Primary Keys: CUID2 everywhere.
- Formatting & Linting: Biome (`bun run check` / `bun run format`). Do not introduce ESLint or Prettier.
