import { z } from "zod";

export const VideoVisibility = z.enum([
	"public",
	"unlisted",
	"private",
	"scheduled",
]);
export type VideoVisibility = z.infer<typeof VideoVisibility>;

export const VideoCategory = z.enum([
	"All",
	"Music",
	"Gaming",
	"Podcasts",
	"Tech",
	"News",
	"Education",
	"Entertainment",
	"Science",
]);
export type VideoCategory = z.infer<typeof VideoCategory>;

export const MuxUploadInput = z.object({
	title: z.string().min(1).max(100),
	description: z.string().max(5000).optional(),
	category: VideoCategory,
});
export type MuxUploadInput = z.infer<typeof MuxUploadInput>;
