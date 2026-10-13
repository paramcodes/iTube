import { z } from "zod";
import { CommentDto } from "./comment";

export const CommentCreatedEvent = z.object({
	type: z.literal("comment:created"),
	comment: CommentDto,
});
export type CommentCreatedEvent = z.infer<typeof CommentCreatedEvent>;

export const CommentStreamEvent = z.discriminatedUnion("type", [
	CommentCreatedEvent,
]);
export type CommentStreamEvent = z.infer<typeof CommentStreamEvent>;
