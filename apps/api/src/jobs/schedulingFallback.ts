import { db, videos } from "@itube/db";
import { and, eq, lte } from "drizzle-orm";
import { redis } from "../lib/redis";

export function startSchedulingFallback() {
	const interval = setInterval(
		async () => {
			try {
				const now = new Date();
				const pastDue = await db
					.select({
						id: videos.id,
						category: videos.category,
					})
					.from(videos)
					.where(
						and(
							eq(videos.visibility, "scheduled"),
							lte(videos.publishedAt, now),
						),
					);

				if (pastDue.length === 0) return;

				for (const item of pastDue) {
					await db
						.update(videos)
						.set({
							visibility: "public",
							updatedAt: new Date(),
						})
						.where(
							and(eq(videos.id, item.id), eq(videos.visibility, "scheduled")),
						);

					try {
						await redis.del(
							"feed:category:All:page1",
							`feed:category:${item.category ?? "All"}:page1`,
						);
					} catch {
						// Non-blocking
					}
				}
			} catch {
				// Loop guard
			}
		},
		5 * 60 * 1000,
	);

	return interval;
}
