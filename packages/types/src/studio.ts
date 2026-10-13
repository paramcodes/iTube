import { z } from "zod";
import { VideoCategory, VideoVisibility } from "./video";

export const StudioVideoUpdate = z.object({
	title: z.string().min(1).max(100).optional(),
	description: z.string().max(5000).optional(),
	category: VideoCategory.optional(),
	visibility: VideoVisibility.optional(),
	thumbnailUrl: z.string().url().optional(),
	publishedAt: z.string().datetime().optional(),
});

export type StudioVideoUpdate = z.infer<typeof StudioVideoUpdate>;
