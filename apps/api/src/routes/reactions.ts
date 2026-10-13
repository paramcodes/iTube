import { ReactionInput } from "@itube/types";
import { Elysia, t } from "elysia";
import { requireChannelOwner } from "../lib/auth";
import {
	toggleCommentReaction,
	toggleVideoReaction,
} from "../services/ReactionService";

export const reactionRoutes = new Elysia()
	.use(requireChannelOwner)
	.post(
		"/api/videos/:id/reactions",
		async ({ channel, params: { id }, body, set }) => {
			const parsed = ReactionInput.safeParse(body);
			if (!parsed.success) {
				set.status = 400;
				return { error: "Invalid reaction type" };
			}
			try {
				return await toggleVideoReaction(channel.id, id, parsed.data.type);
			} catch {
				set.status = 404;
				return { error: "Video not found" };
			}
		},
		{
			params: t.Object({
				id: t.String(),
			}),
		},
	)
	.post(
		"/api/comments/:commentId/reactions",
		async ({ channel, params: { commentId }, body, set }) => {
			const parsed = ReactionInput.safeParse(body);
			if (!parsed.success) {
				set.status = 400;
				return { error: "Invalid reaction type" };
			}
			try {
				return await toggleCommentReaction(
					channel.id,
					commentId,
					parsed.data.type,
				);
			} catch {
				set.status = 404;
				return { error: "Comment not found" };
			}
		},
		{
			params: t.Object({
				commentId: t.String(),
			}),
		},
	);
