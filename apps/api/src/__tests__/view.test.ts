import { describe, expect, it } from "bun:test";

describe("view qualification threshold", () => {
	it("qualifies a view at 30s", () => {
		const qualify = (secs: number, duration: number) =>
			duration <= 30 ? secs >= duration * 0.5 : secs >= 30;
		expect(qualify(30, 120)).toBe(true);
		expect(qualify(29, 120)).toBe(false);
		expect(qualify(10, 15)).toBe(true); // 50% of 15s = 7.5s
		expect(qualify(7, 15)).toBe(false);
	});
});
