# 04 - Real-Time Comments

## Sub-features
- Server-Sent Events (SSE) live comment streaming via `/api/videos/:id/comments/stream`
- Depth-1 comment hierarchy (root comments + 1st-level replies only)
- Optimistic comment composition and instant prepend
- Lazy reply thread expansion ("View N replies")

## How to Get to It
Scroll beneath the video player on `/watch/[videoId]`.

## Driving with Harness
```ts
await page.goto('/watch/sample-video-id')
const textarea = page.getByPlaceholder('Add a comment...')
await textarea.fill('Great video!')
await page.getByRole('button', { name: 'Comment' }).click()
```

## Gotchas
- Sub-replies deeper than depth 1 are blocked by the API depth-guard.
- SSE connection automatically disconnects on page unmount to avoid Bun socket leaks.
