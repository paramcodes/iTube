# 03 - Video Watch & Playback

## Sub-features
- HLS adaptive streaming video player powered by Mux Video SDK
- Custom bottom controls: Red accent scrubber, mute toggle, theater mode, fullscreen
- Keyboard navigation shortcuts (`space` / `k` for play, `m` for mute, `f` for fullscreen, `t` for theater)
- Optimistic Like and Dislike reaction toggling

## How to Get to It
Click any video card or navigate to `/watch/[videoId]`.

## Driving with Harness
```ts
await page.goto('/watch/sample-video-id')
await page.keyboard.press('k') // toggle play
await page.keyboard.press('t') // toggle theater
```

## Gotchas
- Progress heartbeat sends a beacon to `/api/videos/:id/progress` on unload/pagehide.
