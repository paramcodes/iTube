# Search, Autocomplete Suggestions, and Category Feed Architecture

Type: grilling
Status: resolved
Blocked by: 04

## Question

How should video search and search suggestions be implemented (Postgres full-text search with `tsvector` and `pg_trgm` vs Upstash Search vs client-side debounced queries)? How are category chips cached and mapped to video queries, and how will cursor-based infinite scrolling be structured in the feed endpoints?

## Answer

Video search, autocomplete suggestions, category filtering, and keyset pagination architecture defined:

### 1. PostgreSQL Full-Text Search Engine
- **Schema**: Generated column in PostgreSQL:
  `search_vector: tsvector` generated from `setweight(to_tsvector('english', title), 'A') || setweight(to_tsvector('english', description), 'B')`.
- **Index**: GIN index on `videos (search_vector)`.
- **Execution**:
  `websearch_to_tsquery('english', query)` filtered by `visibility = 'public'` and ordered by `ts_rank_cd(search_vector, query_ts) DESC, view_count DESC`.
  Secondary query joins `channels` matching `name ILIKE %query%` or `handle ILIKE %query%` to return prominent Channel badges at the top of search results.

### 2. Masthead Autocomplete Suggestions
- **Client**: Search input with 150ms debounce calling `GET /api/search/suggestions?q={query}`.
- **Cache-First**: Elysia checks Upstash Redis `search_suggest:{query}` (TTL: 1 hour).
- **Database Fallback**: On miss, executes `SELECT DISTINCT title FROM videos WHERE title ILIKE query || '%' AND visibility = 'public' ORDER BY view_count DESC LIMIT 8` (using `pg_trgm` gin index), populates Redis, and returns results in < 5ms.

### 3. Category Filter Chips & Page-1 Caching
- **Categories**: Predefined domain constants in `packages/types`:
  `['All', 'Music', 'Gaming', 'Podcasts', 'Tech', 'News', 'Education', 'Entertainment', 'Science']`.
- **Fast First Paint**: Elysia caches the initial page (first 20 items) for each category chip in Upstash Redis (`feed:category:{category}:page1`, TTL: 300s). Switching category chips loads instantaneously without database queries.

### 4. Keyset / Cursor-Based Infinite Scrolling
- **Cursor Structure**: Opaque base64 string encoding `{ publishedAt: string, id: string }`.
- **Drizzle Keyset Query**:
  Filters via `(published_at < cursor.publishedAt) OR (published_at = cursor.publishedAt AND id < cursor.id)` ordered by `published_at DESC, id DESC`.
  Fetches `limit + 1` (21 items) to detect hasMore without a costly `COUNT(*)` database scan.
- **Client Integration**: Consumed via TanStack React Query `useInfiniteQuery({ getNextPageParam: (lastPage) => lastPage.nextCursor })`. Immune to drift, duplicate cards, or skipped items when new videos are published.

