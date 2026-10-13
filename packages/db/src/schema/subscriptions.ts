import { sql } from "drizzle-orm";
import {
	check,
	pgTable,
	primaryKey,
	text,
	timestamp,
} from "drizzle-orm/pg-core";
import { channels } from "./channels";

export const subscriptions = pgTable(
	"subscriptions",
	{
		subscriberChannelId: text("subscriber_channel_id")
			.notNull()
			.references(() => channels.id, { onDelete: "cascade" }),
		targetChannelId: text("target_channel_id")
			.notNull()
			.references(() => channels.id, { onDelete: "cascade" }),
		createdAt: timestamp("created_at", { withTimezone: true })
			.defaultNow()
			.notNull(),
	},
	(table) => [
		primaryKey({
			columns: [table.subscriberChannelId, table.targetChannelId],
			name: "subscriptions_pk",
		}),
		check(
			"subscriptions_no_self_sub_check",
			sql`${table.subscriberChannelId} <> ${table.targetChannelId}`,
		),
	],
);
