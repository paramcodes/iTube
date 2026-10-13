import { channelStatsDaily, channels, db } from "@itube/db";
import { redis } from "../lib/redis";

export function startDailyStatsRollup() {
	const interval = setInterval(
		async () => {
			try {
				const yesterday = new Date();
				yesterday.setDate(yesterday.getDate() - 1);
				const dateStr = yesterday.toISOString().split("T")[0] ?? "";

				const allChannels = await db.select({ id: channels.id }).from(channels);

				for (const ch of allChannels) {
					const watchSecondsKey = `watch_seconds_daily:${ch.id}:${dateStr}`;
					const watchSeconds =
						Number(await redis.get<string | number>(watchSecondsKey)) || 0;

					await db
						.insert(channelStatsDaily)
						.values({
							channelId: ch.id,
							date: dateStr,
							views: 0,
							subscribersGained: 0,
							subscribersLost: 0,
							watchTimeSeconds: watchSeconds,
						})
						.onConflictDoUpdate({
							target: [channelStatsDaily.channelId, channelStatsDaily.date],
							set: {
								watchTimeSeconds: watchSeconds,
							},
						});
				}
			} catch {
				// Loop protection
			}
		},
		24 * 60 * 60 * 1000,
	);

	return interval;
}
