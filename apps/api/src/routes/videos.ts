import { createHash } from "node:crypto";
import { channels, db, videos } from "@itube/db";
import { eq } from "drizzle-orm";
import { Elysia, t } from "elysia";
import { requireChannelOwner } from "../lib/auth";
import {
	getViewCount,
	qualifyView,
	syncWatchHistory,
} from "../services/ViewService";

export const videoRoutes = new Elysia({ prefix: "/api/videos" })
	.get(
		"/:id",
		async ({ params: { id }, set }) => {
			const [row] = await db
				.select({
					id: videos.id,
					title: videos.title,
					description: videos.description,
					category: videos.category,
					muxPlaybackId: videos.muxPlaybackId,
					durationSeconds: videos.durationSeconds,
					aspectRatio: videos.aspectRatio,
					visibility: videos.visibility,
					publishedAt: videos.publishedAt,
					viewCount: videos.viewCount,
					likeCount: videos.likeCount,
					dislikeCount: videos.dislikeCount,
					commentCount: videos.commentCount,
					createdAt: videos.createdAt,
					channel: {
						id: channels.id,
						name: channels.name,
						handle: channels.handle,
						avatarUrl: channels.avatarUrl,
						subscriberCount: channels.subscriberCount,
					},
				})
				.from(videos)
				.innerJoin(channels, eq(videos.channelId, channels.id))
				.where(eq(videos.id, id));

			if (!row) {
				set.status = 404;
				return { error: "Video not found" };
			}

			const totalViewCount = await getViewCount(row.id, row.viewCount);

			return {
				...row,
				viewCount: totalViewCount,
			};
		},
		{
			params: t.Object({
				id: t.String(),
			}),
		},
	)
	.post(
		"/:id/view",
		async ({ headers, params: { id }, body, set }) => {
			const video = await db.query.videos.findFirst({
				where: eq(videos.id, id),
				columns: {
					id: true,
					durationSeconds: true,
				},
			});

			if (!video) {
				set.status = 404;
				return { error: "Video not found" };
			}

			const ip = (
				headers["x-forwarded-for"] ||
				headers["cf-connecting-ip"] ||
				"127.0.0.1"
			)
				.toString()
				.trim();
			const ua = (headers["user-agent"] || "unknown").toLowerCase().trim();
			const viewerId = createHash("sha256").update(`${ip}:${ua}`).digest("hex");

			const qualified = await qualifyView(
				video.id,
				viewerId,
				body.sessionSeconds,
				video.durationSeconds ?? 0,
			);

			return { qualified };
		},
		{
			params: t.Object({
				id: t.String(),
			}),
			body: t.Object({
				sessionId: t.String(),
				sessionSeconds: t.Number(),
			}),
		},
	)
	.use(requireChannelOwner)
	.post(
		"/:id/progress",
		async ({ channel, params: { id }, body, set }) => {
			const video = await db.query.videos.findFirst({
				where: eq(videos.id, id),
				columns: {
					id: true,
					durationSeconds: true,
				},
			});

			if (!video) {
				set.status = 404;
				return { error: "Video not found" };
			}

			await syncWatchHistory(
				channel.id,
				video.id,
				body.positionSeconds,
				video.durationSeconds ?? 0,
			);

			return { success: true };
		},
		{
			params: t.Object({
				id: t.String(),
			}),
			body: t.Object({
				positionSeconds: t.Number(),
			}),
		},
	);
