import { describe, expect, it } from "bun:test";

describe("web env", () => {
	it("exports NEXT_PUBLIC_API_URL from env", async () => {
		process.env.NEXT_PUBLIC_API_URL = "http://localhost:3001";
		process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = "pk_test_x";
		const { env } = await import("../env");
		expect(env.NEXT_PUBLIC_API_URL).toBe("http://localhost:3001");
	});
});
