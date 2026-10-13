import { init } from "@paralleldrive/cuid2";
import type { AnyPgColumn } from "drizzle-orm/pg-core";
import { index, integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { channels } from "./channels";
import { videos } from "./videos";

const createId = init({ length: 24 });

export const comments = pgTable(
	"comments",
	{
		id: text("id")
			.primaryKey()
			.$defaultFn(() => createId()),
		videoId: text("video_id")
			.notNull()
			.references(() => videos.id, { onDelete: "cascade" }),
		channelId: text("channel_id")
			.notNull()
			.references(() => channels.id, { onDelete: "cascade" }),
		parentId: text("parent_id").references((): AnyPgColumn => comments.id, {
			onDelete: "cascade",
		}),
		content: text("content").notNull(),
		likeCount: integer("like_count").default(0).notNull(),
		dislikeCount: integer("dislike_count").default(0).notNull(),
		replyCount: integer("reply_count").default(0).notNull(),
		createdAt: timestamp("created_at", { withTimezone: true })
			.defaultNow()
			.notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true })
			.defaultNow()
			.notNull(),
	},
	(table) => [
		index("comments_video_id_parent_id_idx").on(table.videoId, table.parentId),
		index("comments_channel_id_idx").on(table.channelId),
	],
);
