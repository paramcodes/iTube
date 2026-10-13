# Mux Direct Upload, Webhook Lifecycle, and Auto-Transcription Integration

Type: research
Status: resolved
Blocked by:

## Question

What is the exact API contract for Mux direct video uploads (`POST /video/v1/uploads` with CORS origin configuration), webhook delivery sequencing (`video.upload.asset_created`, `video.asset.ready`, `video.asset.track.ready`), auto-generated subtitles track configuration (`generated_subtitles` with language tags), storyboard thumbnail sprite endpoint schemas, and how should Elysia Bun verify and handle Mux webhook HMAC signatures reliably?

## Answer

Direct upload contract, webhook event lifecycle, Elysia Bun HMAC signature verification, and asset delivery schemas documented in `.scratch/youtube-clone/research/mux-video-pipeline.md`.

Key specifications:
- **Direct Upload Contract**: `POST https://api.mux.com/video/v1/uploads` with `cors_origin: "*"`, `new_asset_settings: { playback_policies: ["public"], video_quality: "basic", inputs: [{ generated_subtitles: [{ language_code: "en", name: "English CC" }] }] }`, returning `upload_url` for direct client upload via `@mux/upchunk`.
- **Webhook Event Lifecycle**: Sequence flows `video.upload.asset_created` -> `video.asset.created` -> `video.asset.ready` (extracts `playback_ids`, duration, aspect_ratio) -> `video.asset.track.ready` (captions ready for WebVTT streaming).
- **Elysia Bun HMAC Verification**: Parses `mux-signature` (`t=<timestamp>,v1=<signature>`), checks replay tolerance (≤ 300s), and computes HMAC SHA-256 over `${timestamp}.${rawBody}` compared with `crypto.timingSafeEqual` in Elysia raw text route handler.
- **Asset Delivery Endpoints**: HLS playback (`https://stream.mux.com/{PLAYBACK_ID}.m3u8`), WebVTT captions (`https://stream.mux.com/{PLAYBACK_ID}/text/{TRACK_ID}.vtt`), WebP thumbnails (`https://image.mux.com/{PLAYBACK_ID}/thumbnail.webp`), and storyboard hover scrub sprites (`https://image.mux.com/{PLAYBACK_ID}/storyboard.vtt?format=webp`).
