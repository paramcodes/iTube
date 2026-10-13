import { channels, db, subscriptions } from "@itube/db";
import { and, eq, sql } from "drizzle-orm";
import { Elysia, t } from "elysia";
import { requireChannelOwner } from "../lib/auth";

export const subscriptionRoutes = new Elysia({ prefix: "/api/channels" })
	.use(requireChannelOwner)
	.get(
		"/:handle/subscribed",
		async ({ channel, params: { handle }, set }) => {
			const target = await db.query.channels.findFirst({
				where: eq(channels.handle, handle),
			});

			if (!target) {
				set.status = 404;
				return { error: "Channel not found" };
			}

			const existing = await db.query.subscriptions.findFirst({
				where: and(
					eq(subscriptions.subscriberChannelId, channel.id),
					eq(subscriptions.targetChannelId, target.id),
				),
			});

			return { subscribed: !!existing };
		},
		{
			params: t.Object({
				handle: t.String(),
			}),
		},
	)
	.post(
		"/:handle/subscribe",
		async ({ channel, params: { handle }, set }) => {
			const target = await db.query.channels.findFirst({
				where: eq(channels.handle, handle),
			});

			if (!target) {
				set.status = 404;
				return { error: "Channel not found" };
			}

			if (target.id === channel.id) {
				set.status = 400;
				return { error: "Cannot subscribe to own channel" };
			}

			await db.transaction(async (tx) => {
				await tx
					.insert(subscriptions)
					.values({
						subscriberChannelId: channel.id,
						targetChannelId: target.id,
					})
					.onConflictDoNothing();

				await tx
					.update(channels)
					.set({
						subscriberCount: sql`${channels.subscriberCount} + 1`,
					})
					.where(eq(channels.id, target.id));
			});

			return { subscribed: true };
		},
		{
			params: t.Object({
				handle: t.String(),
			}),
		},
	)
	.delete(
		"/:handle/subscribe",
		async ({ channel, params: { handle }, set }) => {
			const target = await db.query.channels.findFirst({
				where: eq(channels.handle, handle),
			});

			if (!target) {
				set.status = 404;
				return { error: "Channel not found" };
			}

			await db.transaction(async (tx) => {
				const deleted = await tx
					.delete(subscriptions)
					.where(
						and(
							eq(subscriptions.subscriberChannelId, channel.id),
							eq(subscriptions.targetChannelId, target.id),
						),
					)
					.returning();

				if (deleted.length > 0) {
					await tx
						.update(channels)
						.set({
							subscriberCount: sql`greatest(0, ${channels.subscriberCount} - 1)`,
						})
						.where(eq(channels.id, target.id));
				}
			});

			return { subscribed: false };
		},
		{
			params: t.Object({
				handle: t.String(),
			}),
		},
	);
