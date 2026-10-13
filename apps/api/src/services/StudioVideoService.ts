import { channelStatsDaily, db, videos } from "@itube/db";
import {
	type StudioVideoUpdate,
	VideoVisibility,
	decodeCursor,
	encodeCursor,
} from "@itube/types";
import { type SQL, and, desc, eq, gte, lt, or, sql } from "drizzle-orm";
import { redis } from "../lib/redis";
import { mux } from "./MuxService";

export async function listStudioVideos(
	channelId: string,
	opts: {
		cursor?: string | undefined;
		limit?: number | undefined;
		visibility?: string | undefined;
	},
) {
	const pageSize = opts.limit ?? 20;
	const conditions: SQL[] = [eq(videos.channelId, channelId)];

	if (opts.visibility) {
		const parsedVis = VideoVisibility.safeParse(opts.visibility);
		if (parsedVis.success) {
			conditions.push(eq(videos.visibility, parsedVis.data));
		}
	}

	if (opts.cursor) {
		try {
			const decoded = decodeCursor(opts.cursor);
			const cursorDate = new Date(decoded.createdAt);
			const cursorCondition = or(
				lt(videos.createdAt, cursorDate),
				and(eq(videos.createdAt, cursorDate), lt(videos.id, decoded.id)),
			);
			if (cursorCondition) {
				conditions.push(cursorCondition);
			}
		} catch {
			// Ignore cursor parsing error
		}
	}

	const rows = await db
		.select()
		.from(videos)
		.where(and(...conditions))
		.orderBy(desc(videos.createdAt), desc(videos.id))
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
		items: items.map((v) => ({
			...v,
			thumbnailUrl: v.muxPlaybackId
				? `https://image.mux.com/${v.muxPlaybackId}/thumbnail.webp?time=3`
				: null,
		})),
		nextCursor,
	};
}

export async function getStudioVideo(channelId: string, videoId: string) {
	const video = await db.query.videos.findFirst({
		where: and(eq(videos.id, videoId), eq(videos.channelId, channelId)),
	});
	if (!video) return null;
	return {
		...video,
		thumbnailUrl: video.muxPlaybackId
			? `https://image.mux.com/${video.muxPlaybackId}/thumbnail.webp?time=3`
			: null,
	};
}

export async function updateStudioVideo(
	channelId: string,
	videoId: string,
	input: StudioVideoUpdate,
) {
	const existing = await db.query.videos.findFirst({
		where: and(eq(videos.id, videoId), eq(videos.channelId, channelId)),
	});
	if (!existing) return null;

	const updateData: Partial<typeof videos.$inferInsert> = {
		updatedAt: new Date(),
	};

	if (input.title !== undefined) updateData.title = input.title;
	if (input.description !== undefined)
		updateData.description = input.description;
	if (input.category !== undefined) updateData.category = input.category;
	if (input.visibility !== undefined) updateData.visibility = input.visibility;
	if (input.publishedAt !== undefined)
		updateData.publishedAt = new Date(input.publishedAt);

	const [updated] = await db
		.update(videos)
		.set(updateData)
		.where(and(eq(videos.id, videoId), eq(videos.channelId, channelId)))
		.returning();

	// Invalidate feed cache if published
	if (
		updated &&
		(updated.visibility === "public" || existing.visibility === "public")
	) {
		try {
			await redis.del(
				"feed:category:All:page1",
				`feed:category:${updated.category ?? "All"}:page1`,
			);
		} catch {
			// Redis eviction error non-blocking
		}
	}

	return updated;
}

export async function removeStudioVideo(channelId: string, videoId: string) {
	const existing = await db.query.videos.findFirst({
		where: and(eq(videos.id, videoId), eq(videos.channelId, channelId)),
	});
	if (!existing) return false;

	await db
		.delete(videos)
		.where(and(eq(videos.id, videoId), eq(videos.channelId, channelId)));

	if (existing.muxAssetId) {
		try {
			await mux.video.assets.delete(existing.muxAssetId);
		} catch {
			// Asset delete warning
		}
	}

	return true;
}

export async function getChannelAnalytics(
	channelId: string,
	days: 7 | 28 = 28,
) {
	const cutoff = new Date();
	cutoff.setDate(cutoff.getDate() - days);
	const dateStr = cutoff.toISOString().split("T")[0] ?? "";

	const stats = await db
		.select({
			totalViews: sql<number>`coalesce(sum(${channelStatsDaily.views}), 0)`,
			totalWatchTime: sql<number>`coalesce(sum(${channelStatsDaily.watchTimeSeconds}), 0)`,
			netSubscribers: sql<number>`coalesce(sum(${channelStatsDaily.subscribersGained} - ${channelStatsDaily.subscribersLost}), 0)`,
		})
		.from(channelStatsDaily)
		.where(
			and(
				eq(channelStatsDaily.channelId, channelId),
				gte(channelStatsDaily.date, dateStr),
			),
		);

	const summary = stats[0] ?? {
		totalViews: 0,
		totalWatchTime: 0,
		netSubscribers: 0,
	};

	return {
		days,
		views: Number(summary.totalViews),
		watchTimeSeconds: Number(summary.totalWatchTime),
		subscribersGained: Number(summary.netSubscribers),
	};
}
