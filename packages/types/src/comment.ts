import { z } from "zod";
import { ChannelDto } from "./channel";

export const CommentDto = z.object({
	id: z.string(),
	content: z.string(),
	likeCount: z.number(),
	dislikeCount: z.number(),
	replyCount: z.number(),
	createdAt: z.string(),
	channel: ChannelDto,
});
export type CommentDto = z.infer<typeof CommentDto>;

export const PostCommentInput = z.object({
	content: z.string().min(1).max(5000),
	parentId: z.string().optional(),
});
export type PostCommentInput = z.infer<typeof PostCommentInput>;
