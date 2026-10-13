import { channels, comments, db, videos } from "@itube/db";
import {
	CommentCreatedEvent,
	PostCommentInput,
	decodeCursor,
	encodeCursor,
} from "@itube/types";
import {
	type SQL,
	and,
	asc,
	desc,
	eq,
	gt,
	isNull,
	lt,
	or,
	sql,
} from "drizzle-orm";
import { Elysia, t } from "elysia";
import { requireChannelOwner } from "../lib/auth";
import {
	acquireCommentBus,
	publishComment,
	releaseCommentBus,
} from "../lib/commentBus";

export const commentRoutes = new Elysia()
	.get(
		"/api/videos/:id/comments",
		async ({ params: { id: videoId }, query: { cursor, limit } }) => {
			const pageSize = limit ? Number(limit) : 20;
			const conditions: SQL[] = [
				eq(comments.videoId, videoId),
				isNull(comments.parentId),
			];

			if (cursor) {
				try {
					const decoded = decodeCursor(cursor);
					const cursorDate = new Date(decoded.createdAt);
					const cursorCondition = or(
						lt(comments.createdAt, cursorDate),
						and(
							eq(comments.createdAt, cursorDate),
							lt(comments.id, decoded.id),
						),
					);
					if (cursorCondition) {
						conditions.push(cursorCondition);
					}
				} catch {
					// Ignore invalid cursor
				}
			}

			const rows = await db
				.select({
					id: comments.id,
					content: comments.content,
					likeCount: comments.likeCount,
					dislikeCount: comments.dislikeCount,
					replyCount: comments.replyCount,
					createdAt: comments.createdAt,
					channel: {
						id: channels.id,
						name: channels.name,
						handle: channels.handle,
						avatarUrl: channels.avatarUrl,
					},
				})
				.from(comments)
				.innerJoin(channels, eq(comments.channelId, channels.id))
				.where(and(...conditions))
				.orderBy(desc(comments.createdAt), desc(comments.id))
				.limit(pageSize + 1);

			const hasMore = rows.length > pageSize;
			const items = hasMore ? rows.slice(0, pageSize) : rows;

			let nextCursor: string | null = null;
			const lastItem = items[items.length - 1];
			if (hasMore && lastItem) {
				nextCursor = encodeCursor({
					createdAt: lastItem.createdAt,
					id: lastItem.id,
				});
			}

			return {
				items: items.map((i) => ({
					...i,
					createdAt: i.createdAt.toISOString(),
				})),
				nextCursor,
			};
		},
		{
			params: t.Object({
				id: t.String(),
			}),
			query: t.Object({
				cursor: t.Optional(t.String()),
				limit: t.Optional(t.String()),
			}),
		},
	)
	.get(
		"/api/comments/:commentId/replies",
		async ({ params: { commentId }, query: { cursor, limit } }) => {
			const pageSize = limit ? Number(limit) : 20;
			const conditions: SQL[] = [eq(comments.parentId, commentId)];

			if (cursor) {
				try {
					const decoded = decodeCursor(cursor);
					const cursorDate = new Date(decoded.createdAt);
					const cursorCondition = or(
						gt(comments.createdAt, cursorDate),
						and(
							eq(comments.createdAt, cursorDate),
							gt(comments.id, decoded.id),
						),
					);
					if (cursorCondition) {
						conditions.push(cursorCondition);
					}
				} catch {
					// Ignore invalid cursor
				}
			}

			const rows = await db
				.select({
					id: comments.id,
					content: comments.content,
					likeCount: comments.likeCount,
					dislikeCount: comments.dislikeCount,
					replyCount: comments.replyCount,
					createdAt: comments.createdAt,
					channel: {
						id: channels.id,
						name: channels.name,
						handle: channels.handle,
						avatarUrl: channels.avatarUrl,
					},
				})
				.from(comments)
				.innerJoin(channels, eq(comments.channelId, channels.id))
				.where(and(...conditions))
				.orderBy(asc(comments.createdAt), asc(comments.id))
				.limit(pageSize + 1);

			const hasMore = rows.length > pageSize;
			const items = hasMore ? rows.slice(0, pageSize) : rows;

			let nextCursor: string | null = null;
			const lastItem = items[items.length - 1];
			if (hasMore && lastItem) {
				nextCursor = encodeCursor({
					createdAt: lastItem.createdAt,
					id: lastItem.id,
				});
			}

			return {
				items: items.map((i) => ({
					...i,
					createdAt: i.createdAt.toISOString(),
				})),
				nextCursor,
			};
		},
		{
			params: t.Object({
				commentId: t.String(),
			}),
			query: t.Object({
				cursor: t.Optional(t.String()),
				limit: t.Optional(t.String()),
			}),
		},
	)
	.get(
		"/api/videos/:id/comments/stream",
		({ params: { id: videoId } }) => {
			const bus = acquireCommentBus(videoId);
			let heartbeatTimer: ReturnType<typeof setInterval> | null = null;

			const stream = new ReadableStream({
				start(controller) {
					bus.onmessage = (event) => {
						controller.enqueue(
							new TextEncoder().encode(
								`data: ${JSON.stringify(event.data)}\n\n`,
							),
						);
					};

					heartbeatTimer = setInterval(() => {
						controller.enqueue(new TextEncoder().encode(": heartbeat\n\n"));
					}, 25000);
				},
				cancel() {
					if (heartbeatTimer) clearInterval(heartbeatTimer);
					releaseCommentBus(videoId);
				},
			});

			return new Response(stream, {
				headers: {
					"Content-Type": "text/event-stream",
					"Cache-Control": "no-cache",
					Connection: "keep-alive",
				},
			});
		},
		{
			params: t.Object({
				id: t.String(),
			}),
		},
	)
	.use(requireChannelOwner)
	.post(
		"/api/videos/:id/comments",
		async ({ channel, params: { id: videoId }, body, set }) => {
			const parsed = PostCommentInput.safeParse(body);
			if (!parsed.success) {
				set.status = 400;
				return { error: "Invalid comment input", issues: parsed.error.issues };
			}

			if (parsed.data.parentId) {
				const parent = await db.query.comments.findFirst({
					where: eq(comments.id, parsed.data.parentId),
				});

				if (!parent || parent.parentId !== null) {
					set.status = 400;
					return { error: "Replies can only be attached to root comments" };
				}
			}

			const inserted = await db.transaction(async (tx) => {
				const [row] = await tx
					.insert(comments)
					.values({
						videoId,
						channelId: channel.id,
						parentId: parsed.data.parentId ?? null,
						content: parsed.data.content,
					})
					.returning();

				if (!row) throw new Error("Failed to insert comment");

				if (parsed.data.parentId) {
					await tx
						.update(comments)
						.set({ replyCount: sql`${comments.replyCount} + 1` })
						.where(eq(comments.id, parsed.data.parentId));
				} else {
					await tx
						.update(videos)
						.set({ commentCount: sql`${videos.commentCount} + 1` })
						.where(eq(videos.id, videoId));
				}

				return row;
			});

			const commentDto = {
				id: inserted.id,
				content: inserted.content,
				likeCount: inserted.likeCount,
				dislikeCount: inserted.dislikeCount,
				replyCount: inserted.replyCount,
				createdAt: inserted.createdAt.toISOString(),
				channel: {
					id: channel.id,
					name: channel.name,
					handle: channel.handle,
					avatarUrl: channel.avatarUrl,
				},
			};

			if (!parsed.data.parentId) {
				const event = CommentCreatedEvent.parse({
					type: "comment:created",
					comment: commentDto,
				});
				publishComment(videoId, event);
			}

			return commentDto;
		},
		{
			params: t.Object({
				id: t.String(),
			}),
		},
	);
