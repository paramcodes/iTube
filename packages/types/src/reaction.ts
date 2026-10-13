import { z } from "zod";

export const ReactionType = z.enum(["like", "dislike"]);
export type ReactionType = z.infer<typeof ReactionType>;

export const ReactionInput = z.object({
	type: ReactionType,
});
export type ReactionInput = z.infer<typeof ReactionInput>;

export const ReactionResult = z.object({
	userReaction: ReactionType.nullable(),
	likeCount: z.number(),
	dislikeCount: z.number(),
});
export type ReactionResult = z.infer<typeof ReactionResult>;
