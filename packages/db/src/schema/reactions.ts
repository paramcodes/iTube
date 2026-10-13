import { pgTable, primaryKey, text, timestamp } from "drizzle-orm/pg-core";
import { channels } from "./channels";
import { comments } from "./comments";
import { reactionType } from "./enums";
import { videos } from "./videos";

export const videoReactions = pgTable(
	"video_reactions",
	{
		channelId: text("channel_id")
			.notNull()
			.references(() => channels.id, { onDelete: "cascade" }),
		videoId: text("video_id")
			.notNull()
			.references(() => videos.id, { onDelete: "cascade" }),
		type: reactionType("type").notNull(),
		createdAt: timestamp("created_at", { withTimezone: true })
			.defaultNow()
			.notNull(),
	},
	(table) => [
		primaryKey({
			columns: [table.channelId, table.videoId],
			name: "video_reactions_pk",
		}),
	],
);

export const commentReactions = pgTable(
	"comment_reactions",
	{
		channelId: text("channel_id")
			.notNull()
			.references(() => channels.id, { onDelete: "cascade" }),
		commentId: text("comment_id")
			.notNull()
			.references(() => comments.id, { onDelete: "cascade" }),
		type: reactionType("type").notNull(),
		createdAt: timestamp("created_at", { withTimezone: true })
			.defaultNow()
			.notNull(),
	},
	(table) => [
		primaryKey({
			columns: [table.channelId, table.commentId],
			name: "comment_reactions_pk",
		}),
	],
);
