import { channels, db, videos } from "@itube/db";
import { and, desc, eq, ilike, sql } from "drizzle-orm";
import { Elysia, t } from "elysia";
import { redis } from "../lib/redis";

export const searchRoutes = new Elysia({ prefix: "/api/search" })
	.get(
		"/",
		async ({ query: { q, page, limit } }) => {
			const pageNum = page ? Math.max(1, Number(page)) : 1;
			const pageSize = limit ? Number(limit) : 20;
			const offset = (pageNum - 1) * pageSize;

			const tsQuery = sql`websearch_to_tsquery('english', ${q})`;

			const rows = await db
				.select({
					id: videos.id,
					title: videos.title,
					description: videos.description,
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
				.where(
					and(
						eq(videos.visibility, "public"),
						sql`${videos.searchVector} @@ ${tsQuery}`,
					),
				)
				.orderBy(
					sql`ts_rank_cd(${videos.searchVector}, ${tsQuery}) desc`,
					desc(videos.viewCount),
				)
				.limit(pageSize + 1)
				.offset(offset);

			const hasMore = rows.length > pageSize;
			const items = hasMore ? rows.slice(0, pageSize) : rows;

			return {
				items: items.map((item) => ({
					...item,
					thumbnailUrl: item.muxPlaybackId
						? `https://image.mux.com/${item.muxPlaybackId}/thumbnail.webp?time=3`
						: null,
				})),
				hasMore,
				page: pageNum,
			};
		},
		{
			query: t.Object({
				q: t.String(),
				page: t.Optional(t.String()),
				limit: t.Optional(t.String()),
			}),
		},
	)
	.get(
		"/suggestions",
		async ({ query: { q } }) => {
			const cacheKey = `search_suggest:${q}`;
			try {
				const cached = await redis.get<string[]>(cacheKey);
				if (cached && Array.isArray(cached)) {
					return { suggestions: cached };
				}
			} catch {
				// Redis cache failure fallback
			}

			const rows = await db
				.selectDistinct({ title: videos.title })
				.from(videos)
				.where(
					and(eq(videos.visibility, "public"), ilike(videos.title, `${q}%`)),
				)
				.orderBy(desc(videos.viewCount))
				.limit(8);

			const suggestions = rows.map((r) => r.title);

			try {
				await redis.set(cacheKey, JSON.stringify(suggestions), { ex: 3600 });
			} catch {
				// Redis cache write failure
			}

			return { suggestions };
		},
		{
			query: t.Object({
				q: t.String(),
			}),
		},
	);
