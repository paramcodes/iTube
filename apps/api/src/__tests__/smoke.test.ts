import { describe, expect, it } from "bun:test";
import { app } from "../index";

const routes = [
	["GET", "/api/feed"],
	["GET", "/api/search?q=test"],
	["GET", "/api/search/suggestions?q=te"],
	["GET", "/api/videos/nonexistent"],
	["POST", "/api/videos/nonexistent/view"],
	["POST", "/api/videos/nonexistent/reactions"],
	["GET", "/api/videos/nonexistent/comments"],
	["GET", "/api/studio/videos"],
	["GET", "/api/studio/analytics"],
];

describe("API route smoke", () => {
	for (const [method, path] of routes) {
		it(`${method} ${path} is mounted (not 404)`, async () => {
			const res = await app.handle(
				new Request(`http://localhost${path}`, { method: method as string }),
			);
			expect(res.status).not.toBe(404);
		}, 10000);
	}
});
