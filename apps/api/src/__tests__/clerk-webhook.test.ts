import { describe, expect, it } from "bun:test";
import { app } from "../index";

describe("clerk webhook", () => {
	it("POST /api/webhooks/clerk without svix headers returns 400", async () => {
		const res = await app.handle(
			new Request("http://localhost/api/webhooks/clerk", {
				method: "POST",
				body: JSON.stringify({ type: "user.created" }),
				headers: { "Content-Type": "application/json" },
			}),
		);
		expect(res.status).toBe(400);
	});
});
