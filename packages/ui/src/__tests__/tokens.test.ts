import { describe, expect, it } from "bun:test";
import preset from "../theme/tailwind.preset";

describe("tailwind preset", () => {
	it("exposes yt color tokens", () => {
		expect(
			(preset.theme?.extend?.colors as Record<string, Record<string, string>>)
				.yt["bg-base"],
		).toBe("#0f0f0f");
		expect(
			(preset.theme?.extend?.colors as Record<string, Record<string, string>>)
				.yt["accent-red"],
		).toBe("#ff0000");
	});
});
