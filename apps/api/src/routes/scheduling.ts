import { db, videos } from "@itube/db";
import { Receiver } from "@upstash/qstash";
import { and, eq } from "drizzle-orm";
import { Elysia } from "elysia";
import { env } from "../env";
import { redis } from "../lib/redis";

export const schedulingRoutes = new Elysia({ prefix: "/api/webhooks" }).post(
	"/publish-video",
	async ({ headers, request, set }) => {
		const signature = headers["upstash-signature"];
		const rawBody = await request.text();

		if (env.QSTASH_TOKEN && signature) {
			try {
				const receiver = new Receiver({
					currentSigningKey: env.QSTASH_TOKEN,
					nextSigningKey: env.QSTASH_TOKEN,
				});
				const isValid = await receiver.verify({
					signature,
					body: rawBody,
				});
				if (!isValid) {
					set.status = 403;
					return { error: "Invalid QStash signature" };
				}
			} catch {
				set.status = 403;
				return { error: "Failed to verify QStash signature" };
			}
		}

		let payload: { videoId?: string };
		try {
			payload = JSON.parse(rawBody);
		} catch {
			set.status = 400;
			return { error: "Malformed JSON payload" };
		}

		if (!payload.videoId) {
			set.status = 400;
			return { error: "Missing videoId" };
		}

		const video = await db.query.videos.findFirst({
			where: eq(videos.id, payload.videoId),
		});

		if (!video) {
			set.status = 404;
			return { error: "Video not found" };
		}

		// Idempotency: only publish if currently scheduled
		if (video.visibility !== "scheduled") {
			return { published: false, reason: "Video is not in scheduled state" };
		}

		await db
			.update(videos)
			.set({
				visibility: "public",
				publishedAt: new Date(),
				updatedAt: new Date(),
			})
			.where(and(eq(videos.id, video.id), eq(videos.visibility, "scheduled")));

		// Invalidate feed caches
		try {
			await redis.del(
				"feed:category:All:page1",
				`feed:category:${video.category ?? "All"}:page1`,
			);
		} catch {
			// Non-critical cache purge error
		}

		return { published: true };
	},
);
