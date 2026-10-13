import { describe, expect, it } from "bun:test";
import { app } from "../index";

describe("auth middleware", () => {
	it("returns 401 on missing Authorization header", async () => {
		const res = await app.handle(
			new Request("http://localhost/api/studio/videos", { method: "GET" }),
		);
		expect(res.status).toBe(401);
	});
});
