import { init } from "@paralleldrive/cuid2";
import {
	integer,
	pgTable,
	text,
	timestamp,
	uniqueIndex,
} from "drizzle-orm/pg-core";
import { users } from "./users";

const createId = init({ length: 24 });

export const channels = pgTable(
	"channels",
	{
		id: text("id")
			.primaryKey()
			.$defaultFn(() => createId()),
		userId: text("user_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		name: text("name").notNull(),
		handle: text("handle").notNull().unique(),
		avatarUrl: text("avatar_url"),
		bannerUrl: text("banner_url"),
		description: text("description"),
		subscriberCount: integer("subscriber_count").default(0).notNull(),
		createdAt: timestamp("created_at", { withTimezone: true })
			.defaultNow()
			.notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true })
			.defaultNow()
			.notNull(),
	},
	(table) => [uniqueIndex("channels_handle_idx").on(table.handle)],
);
