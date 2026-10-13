# Monorepo Package Topology and Type-Safe Cross-Boundary Contracts

Type: grilling
Status: resolved
Blocked by:

## Question

How should the Bun workspace packages be organized between apps (`apps/web` for Next.js, `apps/api` for Elysia) and shared libraries (`packages/db` for Drizzle, `packages/ui` for Shadcn/Tailwind, `packages/types` for Zod schemas)? How will type-safe RPC contracts be shared across Elysia and Next.js (tRPC client vs Eden Treaty), and how should Clerk authentication session JWT tokens be passed and validated inside the Elysia backend?

## Answer

Monorepo package topology, Eden Treaty RPC protocol, and Clerk authentication context derivation resolved:

### 1. Bun Workspace Package Topology
- `apps/web`: Next.js 15 App Router, React 19, TanStack React Query v5, `@clerk/nextjs`, `@elysiajs/eden`, Tailwind CSS + Shadcn UI.
- `apps/api`: Elysia Bun server, `@clerk/backend`, Mux Video SDK, Upstash Redis client, consuming `packages/db`.
- `packages/db`: Drizzle ORM schemas, relations, migrations, and PostgreSQL client pool.
- `packages/ui`: Radix UI primitives, YouTube theme tokens, Shadcn component variants, Tailwind preset.
- `packages/types`: Shared Zod validation schemas, domain contracts, and shared DTOs.
- `packages/config`: Shared Biome config (`biome.json`), base TypeScript configurations (`tsconfig.base.json`).

### 2. Client-Backend RPC Protocol (Eden Treaty + TanStack Query)
- `apps/web` consumes `apps/api` via `@elysiajs/eden` importing `type App = typeof app`.
- **Client Components**: Wrapped with TanStack React Query (`useQuery` / `useMutation`) using Eden Treaty as fetchers for declarative caching, optimistic updates, and infinite scrolling.
- **Server Components (SSR)**: Direct `await api.resource.get({ headers: ... })` for initial page data loading without duplicating database access logic.

### 3. Clerk Authentication & Channel Context Derivation in Elysia
- **Transport**: Next.js client attaches Clerk session JWT via `Authorization: Bearer <token>` in Eden Treaty requests.
- **Verification**: Elysia auth plugin validates the JWT via `@clerk/backend` `verifyToken(token, { secretKey })`.
- **Channel Resolution**: Scoped middleware loads the user's primary channel from `packages/db` (or auto-provisions one on first authenticated request).
- **Context Injection**: Exposes typed `ctx.user` (Clerk ID, email) and `ctx.channel` (Channel ID, handle, name, avatar) across all protected routes via Elysia's `derive({ as: 'scoped' })`.
