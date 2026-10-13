import { pgEnum } from "drizzle-orm/pg-core";

export const videoVisibility = pgEnum("video_visibility", [
	"public",
	"unlisted",
	"private",
	"scheduled",
]);

export const reactionType = pgEnum("reaction_type", ["like", "dislike"]);

export const playlistType = pgEnum("playlist_type", [
	"custom",
	"watch_later",
	"liked_videos",
]);

export const playlistVisibility = pgEnum("playlist_visibility", [
	"public",
	"unlisted",
	"private",
]);
