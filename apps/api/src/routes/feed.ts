import { channels, db, videos } from "@itube/db";
import { decodeCursor, encodeCursor } from "@itube/types";
import { type SQL, and, desc, eq, lt, or } from "drizzle-orm";
import { Elysia, t } from "elysia";
import { redis } from "../lib/redis";

interface FeedItem {
	id: string;
	title: string;
	muxPlaybackId: string | null;
	viewCount: number;
	likeCount: number;
	publishedAt: Date | null;
	durationSeconds: number | null;
	thumbnailUrl: string | null;
	channel: {
		id: string;
		name: string;
		handle: string;
		avatarUrl: string | null;
	};
}

interface FeedResult {
	items: FeedItem[];
	nextCursor: string | null;
}

export const feedRoutes = new Elysia({ prefix: "/api/feed" }).get(
	"/",
	async ({ query: { category, cursor, limit } }) => {
		const activeCategory = category || "All";
		const pageSize = limit ? Number(limit) : 20;
		const cacheKey = `feed:category:${activeCategory}:page1`;

		// Check page 1 cache if no cursor provided
		if (!cursor && activeCategory !== "All") {
			try {
				const cached = await redis.get<FeedResult>(cacheKey);
				if (cached) {
					return cached;
				}
			} catch {
				// Redis cache read failure fallback to DB
			}
		}

		const conditions: SQL[] = [eq(videos.visibility, "public")];

		if (activeCategory !== "All") {
			conditions.push(eq(videos.category, activeCategory));
		}

		if (cursor) {
			try {
				const decoded = decodeCursor(cursor);
				const cursorDate = new Date(decoded.createdAt);
				const cursorCondition = or(
					lt(videos.publishedAt, cursorDate),
					and(eq(videos.publishedAt, cursorDate), lt(videos.id, decoded.id)),
				);
				if (cursorCondition) {
					conditions.push(cursorCondition);
				}
			} catch {
				// If cursor parsing fails, ignore and fetch top
			}
		}

		const rows = await db
			.select({
				id: videos.id,
				title: videos.title,
				muxPlaybackId: videos.muxPlaybackId,
				viewCount: videos.viewCount,
				likeCount: videos.likeCount,
				publishedAt: videos.publishedAt,
				durationSeconds: videos.durationSeconds,
				channel: {
					id: channels.id,
					name: channels.name,
					handle: channels.handle,
					avatarUrl: channels.avatarUrl,
				},
			})
			.from(videos)
			.innerJoin(channels, eq(videos.channelId, channels.id))
			.where(and(...conditions))
			.orderBy(desc(videos.publishedAt), desc(videos.id))
			.limit(pageSize + 1);

		const hasMore = rows.length > pageSize;
		const items = hasMore ? rows.slice(0, pageSize) : rows;

		let nextCursor: string | null = null;
		const lastItem = items[items.length - 1];
		if (hasMore && lastItem && lastItem.publishedAt) {
			nextCursor = encodeCursor({
				createdAt: lastItem.publishedAt,
				id: lastItem.id,
			});
		}

		const result: FeedResult = {
			items: items.map((item) => ({
				...item,
				thumbnailUrl: item.muxPlaybackId
					? `https://image.mux.com/${item.muxPlaybackId}/thumbnail.webp?time=3`
					: null,
			})),
			nextCursor,
		};

		// Cache page-1 if no cursor and not cached
		if (!cursor && activeCategory !== "All") {
			try {
				await redis.set(cacheKey, JSON.stringify(result), { ex: 300 });
			} catch {
				// Cache write failure
			}
		}

		return result;
	},
	{
		query: t.Object({
			category: t.Optional(t.String()),
			cursor: t.Optional(t.String()),
			limit: t.Optional(t.String()),
		}),
	},
);
