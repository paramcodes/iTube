# Video View Counting, Debouncing, and Upstash Redis Architecture

Type: grilling
Status: resolved
Blocked by: 04

## Question

How will video view events be validated and debounced using Upstash Redis to prevent spam and race conditions (e.g., minimum watch threshold before increment, sliding window per IP or Channel), how will resume-playback timestamps be cached and synced to `watch_history`, and what is the batch flushing strategy from Upstash Redis to Postgres?

## Answer

High-throughput view tracking, Upstash Redis debouncing, and PostgreSQL batch synchronization architecture defined:

### 1. View Qualification & Anti-Abuse Validation
- **Threshold**: Playback heartbeats sent every 10 seconds. A view qualifies once accumulated playback reaches at least 30 seconds (or 50% for videos under 30 seconds duration).
- **Session Tracking**: Ephemeral watch session state stored in Redis under `watch_session:{sessionId}` tracking cumulative playback time and last active timestamp.

### 2. Upstash Redis Deduplication & Cooldown Keys
- **Viewer Identity**: Authenticated `channelId` or anonymous `sha256(ip + userAgent)`.
- **Atomic Cooldown Lock**:
  `SET view_cooldown:{videoId}:{viewerId} 1 EX 7200 NX` (2-hour cooldown).
  If Redis returns `null` (key already exists), the view increment is discarded to prevent refresh spamming.

### 3. Asynchronous Batch Flushing to PostgreSQL
- **Buffering**: Qualifying views execute:
  1. `INCR video_views_buffer:{videoId}`
  2. `SADD dirty_video_views {videoId}`
- **Batch Worker (Every 60s)**:
  Background worker pulls `SMEMBERS dirty_video_views`, executes `GETDEL video_views_buffer:{videoId}` in a Redis pipeline, and issues a single batched Drizzle query:
  `UPDATE videos SET view_count = view_count + buffer WHERE id = ...`.
- **Optimistic Read Overlay**: Video read endpoints compute `totalViewCount = video.viewCount + (await redis.get("video_views_buffer:" + videoId) ?? 0)` to guarantee real-time visibility without database write contention.

### 4. Watch History Resume Sync
- Active playback positions write to Redis `watch_progress:{channelId}:{videoId}` (24h TTL).
- Postgres `watch_history` upserts are throttled to at most once per 30 seconds per viewer, or immediately triggered on player pause or page unload (`navigator.sendBeacon`).

