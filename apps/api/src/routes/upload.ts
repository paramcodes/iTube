import { db, videos } from "@itube/db";
import { MuxUploadInput } from "@itube/types";
import { Elysia } from "elysia";
import { requireChannelOwner } from "../lib/auth";
import { createDirectUpload } from "../services/MuxService";

export const uploadRoutes = new Elysia({ prefix: "/api/upload" })
	.use(requireChannelOwner)
	.post("/presign", async ({ body, channel, set }) => {
		const parsed = MuxUploadInput.safeParse(body);
		if (!parsed.success) {
			set.status = 400;
			return { error: "Invalid upload payload", issues: parsed.error.issues };
		}

		const upload = await createDirectUpload();

		const [newVideo] = await db
			.insert(videos)
			.values({
				channelId: channel.id,
				title: parsed.data.title,
				description: parsed.data.description ?? "",
				category: parsed.data.category,
				muxUploadId: upload.id,
				visibility: "private",
			})
			.returning({ id: videos.id });

		if (!newVideo) {
			set.status = 500;
			return { error: "Failed to record video upload" };
		}

		return {
			uploadUrl: upload.url,
			videoId: newVideo.id,
		};
	});
