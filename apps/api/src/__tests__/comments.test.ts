import { describe, expect, it } from "bun:test";
import { app } from "../index";

describe("comment depth guard", () => {
	it("POST with non-root parentId returns 401", async () => {
		const res = await app.handle(
			new Request("http://localhost/api/videos/nonexistent/comments", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: "Bearer invalid",
				},
				body: JSON.stringify({ content: "hi", parentId: "fake" }),
			}),
		);
		expect(res.status).toBe(401);
	});
});
