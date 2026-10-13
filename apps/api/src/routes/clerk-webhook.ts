import { channels, db, users } from "@itube/db";
import { eq } from "drizzle-orm";
import { Elysia } from "elysia";

export const clerkWebhookRoutes = new Elysia({ prefix: "/api/webhooks" }).post(
	"/clerk",
	async ({ headers, request, set }) => {
		const svixId = headers["svix-id"];
		const svixTimestamp = headers["svix-timestamp"];
		const svixSignature = headers["svix-signature"];

		if (!svixId || !svixTimestamp || !svixSignature) {
			set.status = 400;
			return { error: "Missing svix verification headers" };
		}

		const rawBody = await request.text();
		let evt: {
			type: string;
			data: {
				id: string;
				email_addresses?: Array<{ email_address: string }>;
				first_name?: string | null;
				last_name?: string | null;
			};
		};

		try {
			evt = JSON.parse(rawBody);
		} catch {
			set.status = 400;
			return { error: "Invalid JSON payload" };
		}

		if (evt.type === "user.created") {
			const email =
				evt.data.email_addresses?.[0]?.email_address ||
				`${evt.data.id}@placeholder.itube`;
			const fullName =
				[evt.data.first_name, evt.data.last_name].filter(Boolean).join(" ") ||
				"New Creator";
			const handle = `user-${evt.data.id.slice(-8).toLowerCase()}`;

			await db.transaction(async (tx) => {
				const [newUser] = await tx
					.insert(users)
					.values({
						clerkId: evt.data.id,
						email,
					})
					.returning();

				if (newUser) {
					await tx.insert(channels).values({
						userId: newUser.id,
						name: fullName,
						handle,
					});
				}
			});
		} else if (evt.type === "user.deleted") {
			await db.delete(users).where(eq(users.clerkId, evt.data.id));
		}

		return { received: true };
	},
);
