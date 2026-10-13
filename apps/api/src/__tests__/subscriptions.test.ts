import { describe, expect, it } from "bun:test";
import { app } from "../index";

describe("subscription routes", () => {
	it("GET /api/channels/nonexistent/subscribed returns 401 without auth", async () => {
		const res = await app.handle(
			new Request("http://localhost/api/channels/nonexistent/subscribed", {
				headers: { Authorization: "Bearer invalid" },
			}),
		);
		expect(res.status).toBe(401);
	});
});
