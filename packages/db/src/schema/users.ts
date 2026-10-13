import { init } from "@paralleldrive/cuid2";
import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

const createId = init({ length: 24 });

export const users = pgTable("users", {
	id: text("id")
		.primaryKey()
		.$defaultFn(() => createId()),
	clerkId: text("clerk_id").notNull().unique(),
	email: text("email").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true })
		.defaultNow()
		.notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true })
		.defaultNow()
		.notNull(),
});
