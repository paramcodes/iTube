import {
	boolean,
	index,
	integer,
	pgTable,
	primaryKey,
	text,
	timestamp,
} from "drizzle-orm/pg-core";
import { channels } from "./channels";
import { videos } from "./videos";

export const watchHistory = pgTable(
	"watch_history",
	{
		channelId: text("channel_id")
			.notNull()
			.references(() => channels.id, { onDelete: "cascade" }),
		videoId: text("video_id")
			.notNull()
			.references(() => videos.id, { onDelete: "cascade" }),
		lastPositionSeconds: integer("last_position_seconds").default(0).notNull(),
		totalDurationSeconds: integer("total_duration_seconds")
			.default(0)
			.notNull(),
		completed: boolean("completed").default(false).notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true })
			.defaultNow()
			.notNull(),
	},
	(table) => [
		primaryKey({
			columns: [table.channelId, table.videoId],
			name: "watch_history_pk",
		}),
		index("watch_history_channel_updated_idx").on(
			table.channelId,
			table.updatedAt.desc(),
		),
	],
);
