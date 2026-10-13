import { z } from "zod";

export const ChannelDto = z.object({
	id: z.string(),
	name: z.string(),
	handle: z.string(),
	avatarUrl: z.string().nullable().optional(),
});

export type ChannelDto = z.infer<typeof ChannelDto>;
