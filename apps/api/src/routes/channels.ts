import { channels, db, videos } from "@itube/db";
import { and, desc, eq } from "drizzle-orm";
import { Elysia, t } from "elysia";

export const channelRoutes = new Elysia({ prefix: "/api/channels" })
	.get(
		"/:handle",
		async ({ params: { handle }, set }) => {
			const channel = await db.query.channels.findFirst({
				where: eq(channels.handle, handle),
			});

			if (!channel) {
				set.status = 404;
				return { error: "Channel not found" };
			}

			return {
				id: channel.id,
				name: channel.name,
				handle: channel.handle,
				avatarUrl: channel.avatarUrl,
				bannerUrl: channel.bannerUrl,
				description: channel.description,
				subscriberCount: channel.subscriberCount,
			};
		},
		{
			params: t.Object({
				handle: t.String(),
			}),
		},
	)
	.get(
		"/:handle/videos",
		async ({ params: { handle }, set }) => {
			const channel = await db.query.channels.findFirst({
				where: eq(channels.handle, handle),
			});

			if (!channel) {
				set.status = 404;
				return { error: "Channel not found" };
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
				.where(
					and(
						eq(videos.channelId, channel.id),
						eq(videos.visibility, "public"),
					),
				)
				.orderBy(desc(videos.publishedAt));

			return {
				items: rows.map((r) => ({
					...r,
					thumbnailUrl: r.muxPlaybackId
						? `https://image.mux.com/${r.muxPlaybackId}/thumbnail.webp?time=3`
						: null,
				})),
			};
		},
		{
			params: t.Object({
				handle: t.String(),
			}),
		},
	);
