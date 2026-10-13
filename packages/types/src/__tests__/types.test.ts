import { describe, expect, it } from "bun:test";
import {
	PostCommentInput,
	ReactionType,
	VideoCategory,
	VideoVisibility,
	decodeCursor,
	encodeCursor,
} from "../index";

describe("types", () => {
	it("round-trips cursor", () => {
		const obj = { createdAt: "2024-01-01T00:00:00.000Z", id: "abc123" };
		expect(decodeCursor(encodeCursor(obj))).toEqual(obj);
	});
	it("VideoVisibility enum parses", () => {
		expect(VideoVisibility.parse("public")).toBe("public");
		expect(() => VideoVisibility.parse("unknown")).toThrow();
	});
	it("PostCommentInput rejects empty content", () => {
		expect(() => PostCommentInput.parse({ content: "" })).toThrow();
	});
	it("VideoCategory includes Tech", () => {
		expect(VideoCategory.parse("Tech")).toBe("Tech");
	});
});
