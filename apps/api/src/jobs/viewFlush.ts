import { db, videos } from "@itube/db";
import { sql } from "drizzle-orm";
import { redis } from "../lib/redis";

export function startViewFlushJob() {
	const interval = setInterval(async () => {
		try {
			const videoIds = await redis.smembers<string[]>("dirty_video_views");
			if (!videoIds || videoIds.length === 0) return;

			await redis.srem("dirty_video_views", ...videoIds);

			for (const id of videoIds) {
				const bufferedCount = await redis.getdel<string | number>(
					`video_views_buffer:${id}`,
				);
				const increment = Number(bufferedCount) || 0;

				if (increment > 0) {
					await db
						.update(videos)
						.set({
							viewCount: sql`${videos.viewCount} + ${increment}`,
						})
						.where(sql`${videos.id} = ${id}`);
				}
			}
		} catch {
			// Background worker: catch errors to preserve interval loop
		}
	}, 60000);

	return interval;
}
