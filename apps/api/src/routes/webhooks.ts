import { db, videos } from "@itube/db";
import { and, eq, isNull } from "drizzle-orm";
import { Elysia } from "elysia";
import { env } from "../env";
import { verifyMuxSignature } from "../services/MuxService";

export const webhookRoutes = new Elysia({ prefix: "/api/webhooks" }).post(
	"/mux",
	async ({ headers, request, set }) => {
		const rawBody = await request.text();
		const signature = headers["mux-signature"];

		if (
			!signature ||
			!verifyMuxSignature(signature, rawBody, env.MUX_WEBHOOK_SECRET)
		) {
			set.status = 403;
			return { error: "Invalid webhook signature" };
		}

		let event: {
			type: string;
			data: {
				id?: string;
				upload_id?: string;
				duration?: number;
				aspect_ratio?: string;
				playback_ids?: Array<{ id: string }>;
			};
		};

		try {
			event = JSON.parse(rawBody);
		} catch {
			set.status = 400;
			return { error: "Malformed JSON payload" };
		}

		if (event.type === "video.asset.ready") {
			const uploadId = event.data.upload_id;
			const assetId = event.data.id;
			const playbackId = event.data.playback_ids?.[0]?.id;

			if (uploadId && assetId) {
				// Idempotency: only update if muxAssetId is not already set
				await db
					.update(videos)
					.set({
						muxAssetId: assetId,
						muxPlaybackId: playbackId ?? null,
						durationSeconds: Math.floor(event.data.duration ?? 0),
						aspectRatio: event.data.aspect_ratio ?? "16:9",
					})
					.where(
						and(eq(videos.muxUploadId, uploadId), isNull(videos.muxAssetId)),
					);
			}
		} else if (event.type === "video.asset.deleted") {
			const assetId = event.data.id;
			if (assetId) {
				await db.delete(videos).where(eq(videos.muxAssetId, assetId));
			}
		}

		return { received: true };
	},
);
