import { channels, db } from "@itube/db";
import { eq } from "drizzle-orm";
import { Elysia, t } from "elysia";

export const channelRoutes = new Elysia({ prefix: "/api/channels" }).get(
	"/:handle",
	async ({ params: { handle }, set }) => {
		const channel = await db.query.channels.findFirst({
			where: eq(channels.handle, handle),
		});

		if (!channel) {
			set.status = 404;
			return { error: "Channel not found" };
		}

		return {
			id: channel.id,
			name: channel.name,
			handle: channel.handle,
			avatarUrl: channel.avatarUrl,
		};
	},
	{
		params: t.Object({
			handle: t.String(),
		}),
	},
);
