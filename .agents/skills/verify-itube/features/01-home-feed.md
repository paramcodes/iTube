# 01 - Home Feed & Shell Layout

## Sub-features
- 56px fixed Masthead with YouTube brand typography and search form
- 240px expanded / 72px collapsed collapsible GuideDrawer
- Horizontal scrollable Category Filter Carousel ('All', 'Gaming', 'Tech', etc.)
- Responsive 16:9 video card grid with infinite scroll IntersectionObserver

## How to Get to It
Open `http://localhost:3000/`.

## Driving with Harness
```ts
await page.goto('/')
await page.getByRole('button', { name: 'Gaming' }).click()
await page.getByLabel('Toggle menu').click()
```

## Gotchas
- GuideDrawer state is preserved in component state.
- Category carousel page-1 is cached in Redis with a 300s TTL.
