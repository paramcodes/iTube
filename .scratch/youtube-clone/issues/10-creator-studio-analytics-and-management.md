# Creator Studio Analytics and Video Management

Type: grilling
Status: resolved
Blocked by: 04, 05

## Question

How should Creator Studio analytics queries (aggregate channel views, total watch hours, subscriber delta) be computed and cached without full table scans, and how will creator video management (metadata editing, visibility switching, scheduling, custom thumbnail upload vs Mux frame selection) be structured in Elysia and Next.js?

## Answer

All decisions confirmed via grilling session. Full design below.

---

### 1. Analytics Summary Table: `channel_stats_daily`

A dedicated rollup table accumulates per-day aggregates per channel. Avoids full-table scans on `videos`, `watch_history`, or `subscriptions` at dashboard load time.

#### 1.1 Drizzle Schema

```ts
// packages/db/src/schema/channel-stats-daily.ts
export const channelStatsDaily = pgTable('channel_stats_daily', {
  channelId:      text('channel_id').notNull().references(() => channels.id, { onDelete: 'cascade' }),
  date:           date('date').notNull(),                         // 'YYYY-MM-DD'
  views:          bigint('views', { mode: 'number' }).default(0),
  watchSeconds:   bigint('watch_seconds', { mode: 'number' }).default(0), // flushed from Redis session totals
  subsGained:     integer('subs_gained').default(0),
  subsLost:       integer('subs_lost').default(0),
}, (t) => ({
  pk:    primaryKey({ columns: [t.channelId, t.date] }),
  chIdx: index('channel_stats_daily_channel_id_date_idx').on(t.channelId, t.date),
}));
```

**Composite PK** `(channel_id, date)` is the natural key; the index on the same columns satisfies the 28-row `SUM()` range scan at constant speed regardless of channel lifetime.

#### 1.2 Analytics Query — Creator Studio Dashboard

```ts
// packages/api/src/services/StudioAnalyticsService.ts
export async function getChannelAnalytics(channelId: string, days: 7 | 28 = 28) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);

  const rows = await db
    .select({
      date:         channelStatsDaily.date,
      views:        channelStatsDaily.views,
      watchSeconds: channelStatsDaily.watchSeconds,
      subsGained:   channelStatsDaily.subsGained,
      subsLost:     channelStatsDaily.subsLost,
    })
    .from(channelStatsDaily)
    .where(
      and(
        eq(channelStatsDaily.channelId, channelId),
        gte(channelStatsDaily.date, cutoff.toISOString().slice(0, 10)),
      )
    )
    .orderBy(asc(channelStatsDaily.date));

  return {
    days,
    totalViews:       rows.reduce((s, r) => s + r.views, 0),
    totalWatchHours:  Math.round(rows.reduce((s, r) => s + r.watchSeconds, 0) / 3600),
    subsGained:       rows.reduce((s, r) => s + r.subsGained, 0),
    subsLost:         rows.reduce((s, r) => s + r.subsLost, 0),
    series:           rows,    // daily points for the time-series chart
  };
}
```

No Redis cache at this layer. At max 28 rows per window, the PK-indexed `SUM()` is sub-millisecond. Cache only if profiling shows otherwise.

---

### 2. Nightly Rollup Job

A Bun cron runs at `00:05 UTC` daily, writing yesterday's aggregated row for every channel that had activity. Runs inside `apps/api` as a registered Bun cron:

```ts
// apps/api/src/jobs/dailyStatsRollup.ts
Bun.cron('0 5 0 * * *', async () => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const dateStr = yesterday.toISOString().slice(0, 10);  // 'YYYY-MM-DD'

  // 2a. Flush Redis session watch-seconds per channel into daily row
  //     Key pattern: watch_session:{sessionId} already has channelId + watchSeconds
  //     A secondary key `watch_seconds_daily:{channelId}:{dateStr}` is INCRBY'd
  //     at each 60s heartbeat flush (ticket 05 pattern extended).
  const channelIds: string[] = await getAllActiveChannelIds();

  for (const channelId of channelIds) {
    const watchSecondsKey = `watch_seconds_daily:${channelId}:${dateStr}`;
    const watchSeconds    = parseInt(await redis.getdel(watchSecondsKey) ?? '0', 10);

    // 2b. Views for yesterday: count buffer already flushed to videos.view_count
    //     Read from videos table for this channel's yesterday slice.
    const [{ totalViews }] = await db
      .select({ totalViews: sql<number>`COALESCE(SUM(view_count_delta), 0)` })
      .from(videoViewDeltas)           // ephemeral delta log, if maintained, else derive from view_count diff
      .where(and(eq(videoViewDeltas.channelId, channelId), eq(videoViewDeltas.date, dateStr)));

    // 2c. Subscriber delta for yesterday
    const [{ gained }] = await db
      .select({ gained: count() })
      .from(subscriptions)
      .where(and(eq(subscriptions.targetChannelId, channelId), sql`DATE(created_at) = ${dateStr}`));

    // Unsubscribes require a `deleted_at` soft-delete on subscriptions or an events log.
    // Since the current schema uses hard-delete on unsubscribe, subsLost = 0 for now.
    // Captured in §5 open decisions.

    await db
      .insert(channelStatsDaily)
      .values({ channelId, date: dateStr, views: totalViews, watchSeconds, subsGained: gained, subsLost: 0 })
      .onConflictDoUpdate({
        target: [channelStatsDaily.channelId, channelStatsDaily.date],
        set: { views: sql`excluded.views`, watchSeconds: sql`excluded.watch_seconds`,
               subsGained: sql`excluded.subs_gained` },
      });
  }
});
```

**Watch-second accumulation** extends ticket 05's heartbeat flush: each 60s batch flush also does `INCRBY watch_seconds_daily:{channelId}:{dateStr} {delta}` (EX 172800 — 48h TTL). The nightly job drains these keys.

---

### 3. Video Management CRUD

#### 3.1 Elysia `/api/studio` Route Group

Scoped as a sub-app on the same Elysia instance, protected by `requireChannelOwner` middleware:

```ts
// apps/api/src/routes/studio.ts
const studio = new Elysia({ prefix: '/api/studio' })
  .use(requireChannelOwner)                              // injects ctx.channel; 401 if not authed
  .get('/videos', StudioVideoService.list)              // paginated content list
  .get('/videos/:id', StudioVideoService.get)           // single video detail + analytics
  .patch('/videos/:id', StudioVideoService.update)      // metadata, visibility, thumbnail, reschedule
  .delete('/videos/:id', StudioVideoService.remove)     // soft-delete (sets visibility = 'private', queues Mux asset deletion)
  .get('/analytics', StudioAnalyticsService.dashboard); // 7d / 28d channel summary
```

`requireChannelOwner` middleware:
```ts
async ({ headers, set }, ctx) => {
  const token   = headers.authorization?.split(' ')[1];
  const payload = await verifyToken(token, { secretKey: process.env.CLERK_SECRET_KEY });
  const channel = await db.query.channels.findFirst({
    where: eq(channels.userId, payload.sub),
  });
  if (!channel) { set.status = 401; return 'No channel'; }
  ctx.channel = channel;
}
```

#### 3.2 Video List — Content Tab Query

Index extended to `(channel_id, visibility, created_at DESC)` in the migration:

```ts
// packages/api/src/services/StudioVideoService.ts
export async function list(channelId: string, opts: {
  cursor?: string;
  visibility?: VideoVisibility;
  limit?: number;
}) {
  const limit = opts.limit ?? 30;

  return db
    .select({
      id:          videos.id,
      title:       videos.title,
      visibility:  videos.visibility,
      viewCount:   videos.viewCount,
      likeCount:   videos.likeCount,
      commentCount: videos.commentCount,
      publishedAt: videos.publishedAt,
      createdAt:   videos.createdAt,
      thumbnailUrl: videos.thumbnailUrl,
      duration:    videos.durationSeconds,
    })
    .from(videos)
    .where(
      and(
        eq(videos.channelId, channelId),
        opts.visibility ? eq(videos.visibility, opts.visibility) : undefined,
        opts.cursor     ? lt(videos.createdAt, new Date(opts.cursor)) : undefined,
      )
    )
    .orderBy(desc(videos.createdAt))
    .limit(limit);
}
```

Keyset cursor on `created_at` — the same pattern as ticket 06's public feed. No Redis cache on this list; write invalidation cost exceeds the benefit at creator cardinality.

#### 3.3 Metadata Edit — Mutable Fields & Reschedule Contract

Mutable fields post-upload: `title`, `description`, `category`, `visibility`, `thumbnailUrl`, `publishedAt`.

Visibility transition logic inside `StudioVideoService.update`:

```ts
// Rescheduling: cancel existing QStash message and enqueue new one
if (input.publishedAt && input.visibility === 'scheduled') {
  if (existing.schedulingMessageId) {
    await qstash.messages.delete(existing.schedulingMessageId);
  }
  const { messageId } = await qstash.publishJSON({
    url: `${process.env.API_BASE_URL}/api/webhooks/publish-video`,
    notBefore: Math.floor(new Date(input.publishedAt).getTime() / 1000),
    body: { videoId: existing.id },
  });
  updates.schedulingMessageId = messageId;
  updates.publishedAt = new Date(input.publishedAt);
}

// Immediate publish: cancel scheduled message if pending
if (input.visibility === 'public' && existing.visibility === 'scheduled') {
  if (existing.schedulingMessageId) {
    await qstash.messages.delete(existing.schedulingMessageId);
  }
  updates.schedulingMessageId = null;
  updates.publishedAt = new Date();
  // Trigger feed cache invalidation (ticket 08 pattern)
  await invalidateFeedCaches(existing.channelId, existing.category);
}
```

---

### 4. Thumbnail Strategy

#### 4.1 Default Thumbnail (During Processing → Before Custom Upload)

Mux auto-generates frames on asset ready. The video row stores `thumbnail_url` defaulting to:
```
https://image.mux.com/{PLAYBACK_ID}/thumbnail.webp?time=3
```
The Mux frame picker in Creator Studio exposes a time-offset input; changing `?time=N` updates `thumbnailUrl` in place — no upload needed.

#### 4.2 Custom Thumbnail Upload (Replaces Mux Default)

Custom thumbnails (JPEG / PNG / WebP, max 2MB) upload directly to Cloudflare R2 or S3 via a presigned PUT URL:

```ts
// Elysia endpoint: GET /api/studio/videos/:id/thumbnail-upload-url
const { presignedUrl, objectKey } = await generatePresignedPut({
  bucket: process.env.THUMBNAIL_BUCKET,
  key: `thumbnails/${videoId}/${Date.now()}.webp`,
  contentType: 'image/webp',
  expiresIn: 300,
});

// After client PUT completes, client confirms via:
// PATCH /api/studio/videos/:id  { thumbnailUrl: 'https://cdn.itube.com/thumbnails/...' }
```

The CDN URL (Cloudflare R2 public domain or CloudFront) replaces the Mux frame URL in `videos.thumbnail_url`. No server-side proxying of the image; client uploads directly to object storage.

---

### 5. Open Decisions (Deferred)

- **Unsubscribe tracking for `subs_lost`**: Hard-deletes on `subscriptions` lose the deletion timestamp. Options: add soft-delete `deleted_at` column to `subscriptions`, or add a lightweight `subscription_events` append-only log. Deferred until subscriber analytics are prioritized.
- **Video view delta log**: The nightly rollup derives `views` from `video_views_buffer` keys still in Redis at rollup time. If the 60s flush already cleared the buffer, yesterday's view delta is lost. Mitigation: maintain a `video_view_deltas (channel_id, date, delta)` table that the 60s flush appends to atomically alongside the `videos.view_count` update.
