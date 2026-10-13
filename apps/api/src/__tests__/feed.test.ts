import { describe, expect, it } from "bun:test";
import { decodeCursor, encodeCursor } from "@itube/types";

describe("feed cursor", () => {
	it("round-trips date cursor", () => {
		const d = new Date("2024-06-15T10:00:00.000Z");
		const encoded = encodeCursor({ createdAt: d, id: "vid_abc" });
		const decoded = decodeCursor(encoded);
		expect(decoded.createdAt).toBe("2024-06-15T10:00:00.000Z");
		expect(decoded.id).toBe("vid_abc");
	});
});
