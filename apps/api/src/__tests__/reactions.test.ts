import { describe, expect, it } from "bun:test";

describe("reaction delta calculation", () => {
	type RT = "like" | "dislike" | null;

	function computeDeltas(prev: RT, next: "like" | "dislike") {
		const removing = prev === next;
		return {
			userReaction: removing ? null : next,
			likeDelta:
				(next === "like" && !removing ? 1 : 0) -
				(prev === "like" && (removing || next !== "like") ? 1 : 0),
			dislikeDelta:
				(next === "dislike" && !removing ? 1 : 0) -
				(prev === "dislike" && (removing || next !== "dislike") ? 1 : 0),
		};
	}

	it("like from neutral: +1 like", () => {
		const r = computeDeltas(null, "like");
		expect(r).toMatchObject({
			userReaction: "like",
			likeDelta: 1,
			dislikeDelta: 0,
		});
	});
	it("like again (un-react): -1 like", () => {
		const r = computeDeltas("like", "like");
		expect(r).toMatchObject({
			userReaction: null,
			likeDelta: -1,
			dislikeDelta: 0,
		});
	});
	it("flip like → dislike: -1 like +1 dislike", () => {
		const r = computeDeltas("like", "dislike");
		expect(r).toMatchObject({
			userReaction: "dislike",
			likeDelta: -1,
			dislikeDelta: 1,
		});
	});
	it("dislike from neutral: +1 dislike", () => {
		const r = computeDeltas(null, "dislike");
		expect(r).toMatchObject({
			userReaction: "dislike",
			likeDelta: 0,
			dislikeDelta: 1,
		});
	});
});
