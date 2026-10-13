import { init } from "@paralleldrive/cuid2";
import { sql } from "drizzle-orm";
import {
	bigint,
	customType,
	index,
	integer,
	pgTable,
	text,
	timestamp,
} from "drizzle-orm/pg-core";
import { channels } from "./channels";
import { videoVisibility } from "./enums";

const createId = init({ length: 24 });

const tsvector = customType<{ data: string }>({
	dataType() {
		return "tsvector";
	},
});

export const videos = pgTable(
	"videos",
	{
		id: text("id")
			.primaryKey()
			.$defaultFn(() => createId()),
		channelId: text("channel_id")
			.notNull()
			.references(() => channels.id, { onDelete: "cascade" }),
		title: text("title").notNull(),
		description: text("description"),
		category: text("category"),
		muxAssetId: text("mux_asset_id"),
		muxPlaybackId: text("mux_playback_id"),
		muxUploadId: text("mux_upload_id"),
		durationSeconds: integer("duration_seconds"),
		aspectRatio: text("aspect_ratio"),
		visibility: videoVisibility("visibility").default("private").notNull(),
		publishedAt: timestamp("published_at", { withTimezone: true }),
		viewCount: bigint("view_count", { mode: "number" }).default(0).notNull(),
		likeCount: integer("like_count").default(0).notNull(),
		dislikeCount: integer("dislike_count").default(0).notNull(),
		commentCount: integer("comment_count").default(0).notNull(),
		searchVector: tsvector("search_vector").generatedAlwaysAs(
			sql`setweight(to_tsvector('english', coalesce(title, '')), 'A') || setweight(to_tsvector('english', coalesce(description, '')), 'B')`,
		),
		createdAt: timestamp("created_at", { withTimezone: true })
			.defaultNow()
			.notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true })
			.defaultNow()
			.notNull(),
	},
	(table) => [
		index("videos_channel_id_idx").on(table.channelId),
		index("videos_visibility_published_at_idx").on(
			table.visibility,
			table.publishedAt,
		),
		index("videos_category_visibility_idx").on(
			table.category,
			table.visibility,
		),
		index("videos_studio_idx").on(
			table.channelId,
			table.visibility,
			table.createdAt.desc(),
		),
		index("videos_search_vector_gin_idx").using("gin", table.searchVector),
	],
);
