import { init } from "@paralleldrive/cuid2";
import { sql } from "drizzle-orm";
import {
	index,
	integer,
	pgTable,
	primaryKey,
	text,
	timestamp,
	uniqueIndex,
} from "drizzle-orm/pg-core";
import { channels } from "./channels";
import { playlistType, playlistVisibility } from "./enums";
import { videos } from "./videos";

const createId = init({ length: 24 });

export const playlists = pgTable(
	"playlists",
	{
		id: text("id")
			.primaryKey()
			.$defaultFn(() => createId()),
		channelId: text("channel_id")
			.notNull()
			.references(() => channels.id, { onDelete: "cascade" }),
		title: text("title").notNull(),
		description: text("description"),
		type: playlistType("type").default("custom").notNull(),
		visibility: playlistVisibility("visibility").default("private").notNull(),
		videoCount: integer("video_count").default(0).notNull(),
		createdAt: timestamp("created_at", { withTimezone: true })
			.defaultNow()
			.notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true })
			.defaultNow()
			.notNull(),
	},
	(table) => [
		index("playlists_channel_id_idx").on(table.channelId),
		uniqueIndex("playlists_channel_system_type_idx")
			.on(table.channelId, table.type)
			.where(sql`${table.type} != 'custom'`),
	],
);

export const playlistVideos = pgTable(
	"playlist_videos",
	{
		playlistId: text("playlist_id")
			.notNull()
			.references(() => playlists.id, { onDelete: "cascade" }),
		videoId: text("video_id")
			.notNull()
			.references(() => videos.id, { onDelete: "cascade" }),
		position: integer("position").notNull(),
		addedAt: timestamp("added_at", { withTimezone: true })
			.defaultNow()
			.notNull(),
	},
	(table) => [
		primaryKey({
			columns: [table.playlistId, table.videoId],
			name: "playlist_videos_pk",
		}),
		index("playlist_videos_playlist_position_idx").on(
			table.playlistId,
			table.position,
		),
	],
);
