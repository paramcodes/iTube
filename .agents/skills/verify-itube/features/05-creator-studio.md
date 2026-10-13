# 05 - Creator Studio & Video Upload

## Sub-features
- Drag-and-drop / file picker direct upload flow via Mux presigned upload URLs
- Client-side chunked progress bar and status polling
- Creator Studio analytics dashboard (7-day / 28-day rollup of views, watch time, and subscriber delta)
- Content table with inline video editing modal (title, description, category, visibility) and deletion

## How to Get to It
- Navigate to `/upload` or click the 'Upload' button in the Masthead.
- Navigate to `/studio` or click the 'Studio' button in the Masthead.

## Driving with Harness
```ts
await page.goto('/studio')
await page.getByRole('button', { name: 'Edit' }).first().click()
```

## Gotchas
- Routes are protected via Clerk middleware in production.
- Deleting a video triggers remote Mux asset cleanup.
