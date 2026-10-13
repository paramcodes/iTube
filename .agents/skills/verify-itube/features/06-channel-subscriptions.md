# 06 - Channel Profile & Subscriptions

## Sub-features
- Channel banner, avatar, title, handle, subscriber count, and bio
- Optimistic Subscribe / Unsubscribe toggle button
- Channel uploads video tab
- Self-subscription check constraint guard

## How to Get to It
Click any channel name/avatar or navigate directly to `/channel/[handle]`.

## Driving with Harness
```ts
await page.goto('/channel/tech-insider')
const subBtn = page.getByRole('button', { name: /Subscribe/i })
await subBtn.click()
```

## Gotchas
- Subscriber counts are denormalized for instant UI reads without expensive DB count aggregation.
