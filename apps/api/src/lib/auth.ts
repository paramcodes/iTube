import { verifyToken } from "@clerk/backend";
import { channels, db, users } from "@itube/db";
import { eq } from "drizzle-orm";
import { Elysia } from "elysia";
import { env } from "../env";

export const requireChannelOwner = new Elysia({
	name: "requireChannelOwner",
}).derive({ as: "scoped" }, async ({ headers, set }) => {
	const authHeader = headers.authorization;
	const token = authHeader?.startsWith("Bearer ")
		? authHeader.slice(7)
		: authHeader?.split(" ")[1];

	if (!token) {
		set.status = 401;
		return { channel: null as never };
	}

	let payload: Awaited<ReturnType<typeof verifyToken>>;
	try {
		payload = await verifyToken(token, { secretKey: env.CLERK_SECRET_KEY });
	} catch {
		set.status = 401;
		return { channel: null as never };
	}

	if (!payload?.sub) {
		set.status = 401;
		return { channel: null as never };
	}

	const user = await db.query.users.findFirst({
		where: eq(users.clerkId, payload.sub),
	});
	if (!user) {
		set.status = 401;
		return { channel: null as never };
	}

	const channel = await db.query.channels.findFirst({
		where: eq(channels.userId, user.id),
	});
	if (!channel) {
		set.status = 401;
		return { channel: null as never };
	}

	return {
		channel: {
			id: channel.id,
			name: channel.name,
			handle: channel.handle,
			avatarUrl: channel.avatarUrl,
		},
	};
});
