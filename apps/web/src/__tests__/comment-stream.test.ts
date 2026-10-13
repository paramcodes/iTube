import { describe, expect, it } from "bun:test";
import type { CommentDto } from "@itube/types";

function dedupInsert(items: CommentDto[], incoming: CommentDto): CommentDto[] {
	if (items.some((c) => c.id === incoming.id)) return items;
	return [incoming, ...items];
}

const makeComment = (id: string): CommentDto => ({
	id,
	content: "hi",
	likeCount: 0,
	dislikeCount: 0,
	replyCount: 0,
	createdAt: new Date().toISOString(),
	channel: { id: "c1", name: "Chan", handle: "chan", avatarUrl: "" },
});

describe("SSE comment dedup", () => {
	it("inserts new comment", () => {
		const result = dedupInsert([makeComment("a")], makeComment("b"));
		expect(result[0]?.id).toBe("b");
		expect(result).toHaveLength(2);
	});
	it("skips duplicate comment", () => {
		const existing = makeComment("a");
		const result = dedupInsert([existing], makeComment("a"));
		expect(result).toHaveLength(1);
	});
});
