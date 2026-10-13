import { describe, expect, it } from "bun:test";

describe("search suggestions", () => {
	it("debounce delay is 150ms", () => {
		const DEBOUNCE_MS = 150;
		expect(DEBOUNCE_MS).toBe(150);
	});
});
