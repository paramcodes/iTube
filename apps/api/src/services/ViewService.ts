import { db, watchHistory } from "@itube/db";
import { redis } from "../lib/redis";

export async function qualifyView(
	videoId: string,
	viewerId: string,
	sessionSeconds: number,
	videoDurationSeconds: number,
): Promise<boolean> {
	const threshold =
		videoDurationSeconds <= 30
			? sessionSeconds >= videoDurationSeconds * 0.5
			: sessionSeconds >= 30;

	if (!threshold) {
		return false;
	}

	// 2-hour cooldown lock per viewer per video
	const cooldownKey = `view_cooldown:${videoId}:${viewerId}`;
	const acquired = await redis.set(cooldownKey, "1", {
		ex: 7200,
		nx: true,
	});

	if (!acquired) {
		return false;
	}

	await redis.incr(`video_views_buffer:${videoId}`);
	await redis.sadd("dirty_video_views", videoId);

	return true;
}

export async function getViewCount(
	videoId: string,
	dbCount: number,
): Promise<number> {
	const buffered = await redis.get<string | number>(
		`video_views_buffer:${videoId}`,
	);
	return dbCount + (Number(buffered) || 0);
}

export async function syncWatchHistory(
	channelId: string,
	videoId: string,
	positionSeconds: number,
	totalDuration: number,
): Promise<void> {
	const completed = positionSeconds >= totalDuration * 0.9;

	await db
		.insert(watchHistory)
		.values({
			channelId,
			videoId,
			lastPositionSeconds: positionSeconds,
			totalDurationSeconds: totalDuration,
			completed,
			updatedAt: new Date(),
		})
		.onConflictDoUpdate({
			target: [watchHistory.channelId, watchHistory.videoId],
			set: {
				lastPositionSeconds: positionSeconds,
				totalDurationSeconds: totalDuration,
				completed,
				updatedAt: new Date(),
			},
		});
}
