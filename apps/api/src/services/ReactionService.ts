import {
	commentReactions,
	comments,
	db,
	videoReactions,
	videos,
} from "@itube/db";
import type { ReactionResult } from "@itube/types";
import { and, eq, sql } from "drizzle-orm";

type ReactionType = "like" | "dislike";

function computeDeltas(prev: ReactionType | null, next: ReactionType) {
	const removing = prev === next;
	return {
		userReaction: (removing ? null : next) as ReactionType | null,
		likeDelta:
			(next === "like" && !removing ? 1 : 0) -
			(prev === "like" && (removing || next !== "like") ? 1 : 0),
		dislikeDelta:
			(next === "dislike" && !removing ? 1 : 0) -
			(prev === "dislike" && (removing || next !== "dislike") ? 1 : 0),
	};
}

export async function toggleVideoReaction(
	channelId: string,
	videoId: string,
	newType: ReactionType,
): Promise<ReactionResult> {
	return await db.transaction(async (tx) => {
		const existing = await tx.query.videoReactions.findFirst({
			where: and(
				eq(videoReactions.channelId, channelId),
				eq(videoReactions.videoId, videoId),
			),
		});

		const prevType = existing ? existing.type : null;
		const { userReaction, likeDelta, dislikeDelta } = computeDeltas(
			prevType,
			newType,
		);

		if (userReaction === null) {
			await tx
				.delete(videoReactions)
				.where(
					and(
						eq(videoReactions.channelId, channelId),
						eq(videoReactions.videoId, videoId),
					),
				);
		} else {
			await tx
				.insert(videoReactions)
				.values({
					channelId,
					videoId,
					type: newType,
				})
				.onConflictDoUpdate({
					target: [videoReactions.channelId, videoReactions.videoId],
					set: { type: newType },
				});
		}

		const [updated] = await tx
			.update(videos)
			.set({
				likeCount: sql`${videos.likeCount} + ${likeDelta}`,
				dislikeCount: sql`${videos.dislikeCount} + ${dislikeDelta}`,
			})
			.where(eq(videos.id, videoId))
			.returning({
				likeCount: videos.likeCount,
				dislikeCount: videos.dislikeCount,
			});

		if (!updated) {
			throw new Error("Video not found");
		}

		return {
			userReaction,
			likeCount: Math.max(0, updated.likeCount),
			dislikeCount: Math.max(0, updated.dislikeCount),
		};
	});
}

export async function toggleCommentReaction(
	channelId: string,
	commentId: string,
	newType: ReactionType,
): Promise<ReactionResult> {
	return await db.transaction(async (tx) => {
		const existing = await tx.query.commentReactions.findFirst({
			where: and(
				eq(commentReactions.channelId, channelId),
				eq(commentReactions.commentId, commentId),
			),
		});

		const prevType = existing ? existing.type : null;
		const { userReaction, likeDelta, dislikeDelta } = computeDeltas(
			prevType,
			newType,
		);

		if (userReaction === null) {
			await tx
				.delete(commentReactions)
				.where(
					and(
						eq(commentReactions.channelId, channelId),
						eq(commentReactions.commentId, commentId),
					),
				);
		} else {
			await tx
				.insert(commentReactions)
				.values({
					channelId,
					commentId,
					type: newType,
				})
				.onConflictDoUpdate({
					target: [commentReactions.channelId, commentReactions.commentId],
					set: { type: newType },
				});
		}

		const [updated] = await tx
			.update(comments)
			.set({
				likeCount: sql`${comments.likeCount} + ${likeDelta}`,
				dislikeCount: sql`${comments.dislikeCount} + ${dislikeDelta}`,
			})
			.where(eq(comments.id, commentId))
			.returning({
				likeCount: comments.likeCount,
				dislikeCount: comments.dislikeCount,
			});

		if (!updated) {
			throw new Error("Comment not found");
		}

		return {
			userReaction,
			likeCount: Math.max(0, updated.likeCount),
			dislikeCount: Math.max(0, updated.dislikeCount),
		};
	});
}
