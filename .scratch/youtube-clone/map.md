## Destination

A comprehensive, validated technical specification, architecture blueprint, schema ERD, API contracts, design token mapping, and sliced execution roadmap for a full-stack YouTube clone monorepo (Bun workspaces, Next.js web app, Elysia API backend, Drizzle ORM + Postgres, Upstash Redis, Clerk auth, Mux video processing with auto-captions, and authentic YouTube design tokens mapped to Tailwind & Shadcn UI).

## Notes

- Domain: Full-stack video streaming and community platform, streaming ingest, and YouTube design system replication.
- Canonical Glossary: See `GLOSSARY.md` for strict terminology (`User`, `Channel`, `Asset`, `Video`, `Playback ID`, `Visibility`, `Reaction`, `Playlist`, `Watch History`, `View Count`).
- Skills every session should consult: `grilling`, `domain-modeling`, `research`, `prototype`.
- Standing architecture preferences:
  - Monorepo: Bun workspaces (`apps/web` for Next.js 15, `apps/api` for Elysia Bun backend).
  - Code hygiene: Biome (linting + formatting), TypeScript strict mode, Zod contract validation.
  - API communication: Type-safe contracts across Elysia backend and Next.js frontend (tRPC or Eden Treaty).
  - Video pipeline: Direct client-to-Mux chunked upload via presigned upload URLs; Mux auto-generated subtitles and storyboard preview thumbnails.
  - Identity & Channel: Clerk handles user authentication; auto-provisions a default 1:1 Channel per User on signup (schema provisioned for 1:N).
  - High-traffic analytics: Upstash Redis for debouncing video view counts, watch position caching, and async flushes to Postgres.
  - Design system: Extract YouTube web production CSS tokens and map cleanly onto Tailwind CSS theme config and Shadcn UI / Radix components.

## Decisions so far

<!-- the index: one line per closed ticket, enough to judge relevance, then zoom the link for the detail the ticket holds -->
- [Extract YouTube Web Design Tokens and Theme Specification](issues/01-extract-youtube-design-tokens.md): Mapped YouTube web dark/light production CSS tokens (#0f0f0f base, #212121 surfaces, 56px masthead, 240px/72px drawer, 16:9 aspect) to Tailwind theme & Shadcn variables.
- [Mux Direct Upload, Webhook Lifecycle, and Auto-Transcription Integration](issues/02-mux-direct-upload-and-webhook-lifecycle.md): Defined direct client upload contract, UpChunk integration, Mux auto-captions, and Elysia Bun HMAC SHA-256 webhook signature verification.
- [Monorepo Package Topology and Type-Safe Cross-Boundary Contracts](issues/03-monorepo-package-topology-and-contracts.md): Established 4-package workspace (`db`, `ui`, `types`, `config`), Eden Treaty RPC with TanStack Query, and Clerk Bearer JWT auth with scoped Channel context derivation.
- [Drizzle ORM Schema and Relational Data Model](issues/04-drizzle-schema-and-relational-data-model.md): Modeled 10 relational tables in `packages/db` with CUID2 PKs, depth-1 nested comments, dedicated reaction tables, visibility enums, and upserted watch history.
- [Video View Counting, Debouncing, and Upstash Redis Architecture](issues/05-view-counting-and-upstash-redis-architecture.md): Defined 30s playback threshold, 2h Redis cooldown locks, 60s batched PostgreSQL buffer flush, and throttled watch history progress sync.
- [Search, Autocomplete Suggestions, and Category Feed Architecture](issues/06-search-suggestions-and-category-feed-architecture.md): Designed PostgreSQL tsvector full-text search with GIN index, Redis-cached prefix autocomplete, category chip caching, and keyset cursor-based infinite scrolling.
- [Prototype YouTube Shell, Guide Drawer, and Video Grid Layout](issues/07-prototype-youtube-shell-and-layout.md): Built interactive 3-variant prototype verifying 56px masthead, 240px/72px collapsible drawer toggle, category carousel, and responsive video card grid.
- [Video Scheduling and Status Automation](issues/08-video-scheduling-and-status-automation.md): Designed dual-layer QStash delayed trigger + 5-min cron fallback, idempotent guarded status mutation, targeted Redis cache invalidation, and pull-based subscription feeds.
- [Custom Quality-Aware Video Player Component Prototype](issues/09-custom-quality-aware-video-player.md): Built interactive 3-variant player prototype verifying YouTube bottom control scrim, red scrubber, WebVTT storyboard hover tooltip, 2-level settings popover, theater mode layout coordination, and full keyboard navigation engine.
- [Creator Studio Analytics and Video Management](issues/10-creator-studio-analytics-and-management.md): Designed `channel_stats_daily` rollup table (PK `channel_id, date`) fed by nightly Bun cron from Redis watch-second keys; `/api/studio` Elysia route group gated by `requireChannelOwner`; keyset-paginated content list; QStash-aware visibility/reschedule mutations; Mux frame default thumbnail with R2 presigned custom upload override.
- [Real-Time Comment & Reaction Updates](issues/11-realtime-comments-and-reactions.md): SSE fan-out via in-process `BroadcastChannel` per video; two keyset-cursor endpoints (top-level comments + lazy replies); CTE-based atomic reaction toggle with synchronous count updates; TanStack Query optimistic prepend + snapshot rollback; SSE dedup hook guards against temp-ID duplicates.

## Not yet specified

_All planned tickets resolved._

## Out of scope

- **Live Streaming Ingest**: Live broadcast via RTMP/WebRTC is ruled out of this effort; focus is on on-demand video.
- **Shorts Vertical Feed**: Vertical short-form swipeable feed is deferred to a future dedicated effort.
- **Monetization & Payments**: Channel memberships, Super Chats, tips, and payment gateways are excluded.
- **Native Mobile Apps**: React Native / Flutter apps are excluded; responsive mobile web viewport is targeted.
- **Multi-Channel Context Switcher UI**: Although the Drizzle schema allows 1:N Channels per User, UI for switching active channels is deferred.
