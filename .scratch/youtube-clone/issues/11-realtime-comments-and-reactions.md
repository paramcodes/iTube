# Real-Time Comment & Reaction Updates

Type: grilling
Status: resolved
Blocked by: 03, 04, 06

## Question

How should comments and reactions be structured for optimistic UI updates, 1-level reply tree pagination, and reaction state transitions without race conditions? How do new comments reach connected viewers in real time, and how are reaction flips handled atomically at the database level?

## Answer

All decisions confirmed via grilling session. Full design below.

---

### 1. Comment Endpoints

Two keyset-cursor endpoints matching the ticket 06 pagination pattern. The `(video_id, parent_id)` composite index on `comments` covers both queries directly.

#### 1.1 Top-Level Comments

```ts
// GET /api/videos/:videoId/comments?cursor=&limit=
// Returns only root comments (parent_id IS NULL), sorted newest-first.

export async function listComments(videoId: string, opts: {
  cursor?: string;   // opaque base64: { createdAt: string; id: string }
  limit?: number;
}) {
  const limit = opts.limit ?? 20;
  const cursor = opts.cursor ? decodeCursor(opts.cursor) : null;

  const rows = await db
    .select({
      id:           comments.id,
      content:      comments.content,
      likeCount:    comments.likeCount,
      dislikeCount: comments.dislikeCount,
      replyCount:   comments.replyCount,
      createdAt:    comments.createdAt,
      channel: {
        id:        channels.id,
        name:      channels.name,
        handle:    channels.handle,
        avatarUrl: channels.avatarUrl,
      },
    })
    .from(comments)
    .innerJoin(channels, eq(comments.channelId, channels.id))
    .where(
      and(
        eq(comments.videoId, videoId),
        isNull(comments.parentId),
        cursor
          ? or(
              lt(comments.createdAt, new Date(cursor.createdAt)),
              and(
                eq(comments.createdAt, new Date(cursor.createdAt)),
                lt(comments.id, cursor.id),
              ),
            )
          : undefined,
      )
    )
    .orderBy(desc(comments.createdAt), desc(comments.id))
    .limit(limit + 1);

  const hasMore = rows.length > limit;
  if (hasMore) rows.pop();

  return {
    items: rows,
    nextCursor: hasMore
      ? encodeCursor({ createdAt: rows.at(-1)!.createdAt, id: rows.at(-1)!.id })
      : null,
  };
}
```

#### 1.2 Replies (Lazy, Per Root Comment)

```ts
// GET /api/comments/:commentId/replies?cursor=&limit=
// Returns depth-1 replies for a single root comment.
// "Load N more replies" button triggers this; collapsed by default.

export async function listReplies(parentId: string, opts: {
  cursor?: string;
  limit?: number;
}) {
  const limit = opts.limit ?? 10;
  const cursor = opts.cursor ? decodeCursor(opts.cursor) : null;

  const rows = await db
    .select({ /* same shape as above */ })
    .from(comments)
    .innerJoin(channels, eq(comments.channelId, channels.id))
    .where(
      and(
        eq(comments.parentId, parentId),
        cursor
          ? or(
              gt(comments.createdAt, new Date(cursor.createdAt)),
              and(eq(comments.createdAt, new Date(cursor.createdAt)), gt(comments.id, cursor.id)),
            )
          : undefined,
      )
    )
    .orderBy(asc(comments.createdAt), asc(comments.id))  // oldest-first for replies
    .limit(limit + 1);

  const hasMore = rows.length > limit;
  if (hasMore) rows.pop();

  return {
    items: rows,
    nextCursor: hasMore
      ? encodeCursor({ createdAt: rows.at(-1)!.createdAt, id: rows.at(-1)!.id })
      : null,
  };
}
```

#### 1.3 Post Comment / Reply

```ts
// POST /api/videos/:videoId/comments
// Body: { content: string; parentId?: string }
// Requires auth (ctx.channel injected by requireChannelOwner middleware).
// Depth-1 guard: if parentId provided, verify the referenced comment has parentId IS NULL.

export async function postComment(
  videoId: string,
  channelId: string,
  input: { content: string; parentId?: string },
) {
  if (input.parentId) {
    const parent = await db.query.comments.findFirst({
      where: and(eq(comments.id, input.parentId), isNull(comments.parentId)),
    });
    if (!parent) throw new Error('INVALID_PARENT'); // 400
  }

  const [comment] = await db.transaction(async (tx) => {
    const [inserted] = await tx
      .insert(comments)
      .values({
        id:        createId(),
        videoId,
        channelId,
        parentId:  input.parentId ?? null,
        content:   input.content,
      })
      .returning();

    // Maintain denormalized counts synchronously
    if (input.parentId) {
      await tx
        .update(comments)
        .set({ replyCount: sql`reply_count + 1` })
        .where(eq(comments.id, input.parentId));
    } else {
      await tx
        .update(videos)
        .set({ commentCount: sql`comment_count + 1` })
        .where(eq(videos.id, videoId));
    }

    return [inserted];
  });

  // Fan out to all SSE connections watching this video (top-level only)
  if (!input.parentId) {
    videoCommentChannel(videoId).postMessage({
      type: 'comment:created',
      comment: await enrichComment(comment), // joins channel row
    });
  }

  return comment;
}
```

---

### 2. Real-Time SSE Fan-Out

#### 2.1 In-Process BroadcastChannel per Video

```ts
// apps/api/src/lib/commentBus.ts
// One BroadcastChannel per active videoId; reused across Elysia handlers.

const channels = new Map<string, BroadcastChannel>();

export function videoCommentChannel(videoId: string): BroadcastChannel {
  if (!channels.has(videoId)) {
    const bc = new BroadcastChannel(`comments:${videoId}`);
    // GC: close the channel when the last SSE subscriber disconnects (tracked separately).
    channels.set(videoId, bc);
  }
  return channels.get(videoId)!;
}
```

Scale-out path (documented, not implemented now): replace `BroadcastChannel` with Upstash Redis pub/sub (`redis.subscribe('comments:{videoId}')`) when the API runs as multiple replicas. The SSE handler shape is identical; only `commentBus.ts` changes.

#### 2.2 SSE Endpoint

```ts
// GET /api/videos/:videoId/comments/stream
// Elysia native SSE — no auth required (public video comments are public).

app.get('/api/videos/:videoId/comments/stream', ({ params, set }) => {
  set.headers['Content-Type']  = 'text/event-stream';
  set.headers['Cache-Control'] = 'no-cache';
  set.headers['Connection']    = 'keep-alive';

  const bc = videoCommentChannel(params.videoId);
  let subscribers = subscriberCount.get(params.videoId) ?? 0;
  subscriberCount.set(params.videoId, ++subscribers);

  return new ReadableStream({
    start(controller) {
      const onMessage = (evt: MessageEvent) => {
        controller.enqueue(`data: ${JSON.stringify(evt.data)}\n\n`);
      };
      bc.addEventListener('message', onMessage);

      // Heartbeat every 25s to keep the connection alive through proxies
      const heartbeat = setInterval(() => {
        controller.enqueue(': heartbeat\n\n');
      }, 25_000);

      // Cleanup on client disconnect
      const cleanup = () => {
        bc.removeEventListener('message', onMessage);
        clearInterval(heartbeat);
        const remaining = (subscriberCount.get(params.videoId) ?? 1) - 1;
        subscriberCount.set(params.videoId, remaining);
        if (remaining === 0) {
          bc.close();
          channels.delete(params.videoId);          // GC idle channel
          subscriberCount.delete(params.videoId);
        }
      };

      return cleanup;
    },
  });
});
```

#### 2.3 SSE Event Schema

```ts
// packages/types/src/comments.ts
export type CommentCreatedEvent = {
  type: 'comment:created';
  comment: {
    id:           string;
    videoId:      string;
    content:      string;
    likeCount:    number;
    dislikeCount: number;
    replyCount:   number;
    createdAt:    string;  // ISO 8601
    channel: {
      id:        string;
      name:      string;
      handle:    string;
      avatarUrl: string;
    };
  };
};

// Only top-level comments are pushed over SSE.
// Replies are fetched on demand via GET /api/comments/:id/replies.
export type CommentStreamEvent = CommentCreatedEvent;
```

---

### 3. Reaction State Machine

#### 3.1 Atomic CTE Upsert — Video Reactions

Single round-trip, idempotent on retry. Handles three cases:
- No prior reaction → insert, increment target count.
- Same reaction type clicked again → delete row, decrement count (un-react toggle).
- Different reaction type → update row, decrement old count, increment new count.

```sql
-- Conceptual CTE; executed via Drizzle sql`` template
WITH
  existing AS (
    SELECT type FROM video_reactions
    WHERE channel_id = $channelId AND video_id = $videoId
    FOR UPDATE
  ),
  deleted AS (
    DELETE FROM video_reactions
    WHERE channel_id = $channelId AND video_id = $videoId
      AND (SELECT type FROM existing) = $newType   -- same type = un-react
    RETURNING type
  ),
  upserted AS (
    INSERT INTO video_reactions (channel_id, video_id, type, created_at)
    SELECT $channelId, $videoId, $newType, NOW()
    WHERE (SELECT type FROM existing) IS DISTINCT FROM $newType  -- new or flip
    ON CONFLICT (channel_id, video_id) DO UPDATE SET type = EXCLUDED.type
    RETURNING type
  )
UPDATE videos SET
  like_count    = like_count
    + CASE WHEN (SELECT type FROM upserted)  = 'like'    THEN 1 ELSE 0 END
    - CASE WHEN (SELECT type FROM existing)  = 'like'    THEN 1 ELSE 0 END,
  dislike_count = dislike_count
    + CASE WHEN (SELECT type FROM upserted)  = 'dislike' THEN 1 ELSE 0 END
    - CASE WHEN (SELECT type FROM existing)  = 'dislike' THEN 1 ELSE 0 END
WHERE id = $videoId;
```

Implemented as a Drizzle `sql` template inside a `db.transaction()` call in `VideoReactionService.toggle`.

#### 3.2 Comment Reactions (Same Pattern)

Identical CTE structure, substituting `comment_reactions` and updating `comments.like_count` / `comments.dislike_count`. Extracted into a shared `reactionToggleCTE(table, targetId)` helper to avoid duplication.

#### 3.3 Elysia Route

```ts
// POST /api/videos/:videoId/reactions   Body: { type: 'like' | 'dislike' }
// POST /api/comments/:commentId/reactions  Body: { type: 'like' | 'dislike' }
// Both require auth. Returns { userReaction: 'like' | 'dislike' | null, likeCount, dislikeCount }.

app.post('/api/videos/:videoId/reactions',
  { body: t.Object({ type: t.Union([t.Literal('like'), t.Literal('dislike')]) }) },
  async ({ params, body, ctx }) => {
    return VideoReactionService.toggle(params.videoId, ctx.channel.id, body.type);
  }
);
```

---

### 4. Optimistic UI — TanStack Query Integration

#### 4.1 Comment Submission (Optimistic Prepend + SSE Dedup)

```ts
// apps/web/src/hooks/usePostComment.ts
const queryClient = useQueryClient();

const mutation = useMutation({
  mutationFn: (input: { content: string; parentId?: string }) =>
    api.videos[videoId].comments.post({ body: input }),

  onMutate: async (input) => {
    await queryClient.cancelQueries({ queryKey: ['comments', videoId] });

    const snapshot = queryClient.getQueryData(['comments', videoId]);

    // Optimistically prepend the comment with a temp ID
    queryClient.setQueryData(['comments', videoId], (old: InfiniteData<CommentsPage>) => ({
      ...old,
      pages: [
        {
          items: [buildOptimisticComment(input, currentChannel), ...old.pages[0].items],
          nextCursor: old.pages[0].nextCursor,
        },
        ...old.pages.slice(1),
      ],
    }));

    return { snapshot };
  },

  onError: (_err, _input, ctx) => {
    // Roll back to snapshot
    queryClient.setQueryData(['comments', videoId], ctx!.snapshot);
  },

  onSettled: () => {
    // Let the SSE stream deliver the server-canonical version;
    // invalidate to remove the temp-ID duplicate once real event arrives.
    queryClient.invalidateQueries({ queryKey: ['comments', videoId] });
  },
});
```

SSE dedup: the `useCommentStream` hook checks incoming `comment:created` events against the current query cache by `id`; if the temp-ID item was already replaced by the `onSettled` invalidation, the SSE event is a no-op. If it races ahead of the invalidation, it replaces the temp item instead.

#### 4.2 Reaction Toggle (Optimistic Count Flip)

```ts
// apps/web/src/hooks/useVideoReaction.ts
const mutation = useMutation({
  mutationFn: (type: ReactionType) =>
    api.videos[videoId].reactions.post({ body: { type } }),

  onMutate: async (type) => {
    await queryClient.cancelQueries({ queryKey: ['video', videoId] });
    const snapshot = queryClient.getQueryData(['video', videoId]);

    queryClient.setQueryData(['video', videoId], (old: VideoDetail) => {
      const prev = old.userReaction;
      const removing = prev === type;   // clicking same type = un-react

      return {
        ...old,
        userReaction:  removing ? null : type,
        likeCount:    old.likeCount
          + (type === 'like'    ? (removing ? -1 : 1) : 0)
          - (prev === 'like'    && !removing && type !== 'like' ? 1 : 0),
        dislikeCount: old.dislikeCount
          + (type === 'dislike' ? (removing ? -1 : 1) : 0)
          - (prev === 'dislike' && !removing && type !== 'dislike' ? 1 : 0),
      };
    });

    return { snapshot };
  },

  onError: (_err, _type, ctx) => {
    queryClient.setQueryData(['video', videoId], ctx!.snapshot);
  },
});
```

#### 4.3 SSE Client Hook

```ts
// apps/web/src/hooks/useCommentStream.ts
export function useCommentStream(videoId: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    const url = `${process.env.NEXT_PUBLIC_API_URL}/api/videos/${videoId}/comments/stream`;
    const es = new EventSource(url);

    es.onmessage = (evt) => {
      const event: CommentStreamEvent = JSON.parse(evt.data);

      if (event.type === 'comment:created') {
        queryClient.setQueryData(
          ['comments', videoId],
          (old: InfiniteData<CommentsPage> | undefined) => {
            if (!old) return old;
            const firstPage = old.pages[0];
            // Dedup: skip if comment already in cache (from own optimistic update)
            if (firstPage.items.some((c) => c.id === event.comment.id)) return old;

            return {
              ...old,
              pages: [
                { ...firstPage, items: [event.comment, ...firstPage.items] },
                ...old.pages.slice(1),
              ],
            };
          },
        );
      }
    };

    return () => es.close();
  }, [videoId, queryClient]);
}
```

---

### 5. TanStack Query Key Conventions

| Data                          | Query Key                                 |
|-------------------------------|-------------------------------------------|
| Video detail + counts         | `['video', videoId]`                      |
| Top-level comments (infinite) | `['comments', videoId]`                   |
| Replies (infinite)            | `['replies', commentId]`                  |
| Current user's video reaction | derived from `['video', videoId]` shape   |
| Current user's comment reacts | `['comment-reaction', commentId]`         |

---

### 6. Open Decisions (Deferred)

- **Comment deletion**: Soft-delete (`deleted_at`) vs hard-delete with tombstone `[deleted]` placeholder. Deferred; affects reply threading display.
- **Moderation / flagging**: Channel owner comment removal and viewer reporting endpoints not in scope here.
- **SSE horizontal scale**: Document the `BroadcastChannel` → Upstash Redis pub/sub migration path when `apps/api` runs more than one replica. The handler contract is unchanged; only `commentBus.ts` is swapped.
- **Reaction visibility**: Whether `dislike_count` is shown publicly (YouTube hides it). UI decision; the API returns it; the frontend can suppress it.
