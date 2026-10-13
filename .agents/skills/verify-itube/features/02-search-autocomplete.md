# 02 - Search & Autocomplete Suggestions

## Sub-features
- 150ms debounced search suggestion dropdown in Masthead
- Ranked full-text search using PostgreSQL `tsvector` and `websearch_to_tsquery`
- Paginated search results view at `/search?q={query}`

## How to Get to It
Type any keyword into the top Masthead input or navigate directly to `/search?q={query}`.

## Driving with Harness
```ts
await page.goto('/')
const searchInput = page.getByPlaceholder('Search')
await searchInput.fill('Tech')
await page.waitForTimeout(400) // allow debounce
await searchInput.press('Enter')
```

## Gotchas
- Suggestions require at least 2 characters to trigger.
- Suggestions are cached in Redis under `search_suggest:{query}` (TTL: 1 hour).
