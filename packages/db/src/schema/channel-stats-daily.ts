import {
	date,
	index,
	integer,
	pgTable,
	primaryKey,
	text,
} from "drizzle-orm/pg-core";
import { channels } from "./channels";

export const channelStatsDaily = pgTable(
	"channel_stats_daily",
	{
		channelId: text("channel_id")
			.notNull()
			.references(() => channels.id, { onDelete: "cascade" }),
		date: date("date").notNull(),
		views: integer("views").default(0).notNull(),
		subscribersGained: integer("subscribers_gained").default(0).notNull(),
		subscribersLost: integer("subscribers_lost").default(0).notNull(),
		watchTimeSeconds: integer("watch_time_seconds").default(0).notNull(),
	},
	(table) => [
		primaryKey({
			columns: [table.channelId, table.date],
			name: "channel_stats_daily_pk",
		}),
		index("channel_stats_daily_channel_date_idx").on(
			table.channelId,
			table.date,
		),
	],
);
