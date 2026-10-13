import { describe, expect, it } from "bun:test";

describe("publish-video idempotency guard", () => {
	const shouldPublish = (visibility: string) => visibility === "scheduled";

	it("publishes scheduled video", () =>
		expect(shouldPublish("scheduled")).toBe(true));
	it("ignores already-public video", () =>
		expect(shouldPublish("public")).toBe(false));
	it("ignores private video", () =>
		expect(shouldPublish("private")).toBe(false));
});
