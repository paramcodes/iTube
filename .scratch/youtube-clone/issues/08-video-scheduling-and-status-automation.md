# Video Scheduling and Status Automation

Type: grilling
Status: resolved
Blocked by: 04, 05

## Question

How should scheduled video status transitions be triggered at the release timestamp (Upstash QStash delayed message at `published_at` vs scheduled cron poll on `WHERE visibility = 'scheduled' AND published_at <= NOW()`), and how will feed caches and subscriber notifications be invalidated when a scheduled video becomes public?

## Answer

Video scheduling pipeline, atomic status transition, cache invalidation, and subscription feed delivery resolved:

### 1. Dual-Layer Scheduling Architecture (QStash + Self-Healing Cron)
- **Primary Trigger (Exact-Second Execution)**:
  When a video is saved with `visibility = 'scheduled'`, Elysia enqueues a delayed message via Upstash QStash:
  `await qstash.publishJSON({ url: 'https://api.itube.com/api/webhooks/publish-video', notBefore: Math.floor(publishedAt.getTime() / 1000), body: { videoId } })`.
  Stores `scheduling_message_id` on the video record to enable cancellation (`qstash.messages.delete`) if the creator changes visibility or release date.
- **Fallback Safety Sweep (Every 5 Minutes)**:
  A background Bun cron sweep polls `SELECT id FROM videos WHERE visibility = 'scheduled' AND published_at <= NOW() LIMIT 50` as a self-healing safety net.

### 2. Idempotent State Transition
- Elysia endpoint verifies QStash HMAC signature via `@upstash/qstash` receiver.
- Executes atomic guarded SQL update:
  ```ts
  const [updated] = await db.update(videos)
    .set({ visibility: 'public', updatedAt: new Date() })
    .where(and(eq(videos.id, videoId), eq(videos.visibility, 'scheduled'), lte(videos.publishedAt, new Date())))
    .returning({ id: videos.id, channelId: videos.channelId, category: videos.category, title: videos.title });
  ```
  If `updated` is undefined, execution terminates immediately, preventing duplicate fanout.

### 3. Targeted Redis Cache Invalidation
- Invalidates affected feed caches in Upstash Redis:
  - `DEL feed:category:{category}:page1`
  - `DEL feed:category:All:page1`
  - `DEL channel:{channelId}:videos:page1`
  - Creator Studio video list cache.
- Avoids global `FLUSHDB`, preserving video view buffers and suggestion caches.

### 4. Pull-Based Subscription Feed & In-App Notification Fanout
- **Subscription Feed**: Pull-based query joining `subscriptions` on `target_channel_id` with `visibility = 'public'` ordered by `published_at DESC`. Scales to millions of subscribers with zero publish-time write amplification.
- **Bell Notifications**: Batched background insertion into `notifications` table for subscribers with bell notifications active.

