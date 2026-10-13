import { describe, expect, it } from "bun:test";

function applyReaction(
	old: {
		userReaction: "like" | "dislike" | null;
		likeCount: number;
		dislikeCount: number;
	},
	type: "like" | "dislike",
) {
	const prev = old.userReaction;
	const removing = prev === type;
	return {
		userReaction: removing ? null : type,
		likeCount:
			old.likeCount +
			(type === "like" && !removing ? 1 : 0) -
			(prev === "like" && (removing || type !== "like") ? 1 : 0),
		dislikeCount:
			old.dislikeCount +
			(type === "dislike" && !removing ? 1 : 0) -
			(prev === "dislike" && (removing || type !== "dislike") ? 1 : 0),
	};
}

describe("useVideoReaction optimistic delta", () => {
	it("like from neutral", () =>
		expect(
			applyReaction(
				{ userReaction: null, likeCount: 5, dislikeCount: 2 },
				"like",
			),
		).toMatchObject({ userReaction: "like", likeCount: 6, dislikeCount: 2 }));
	it("un-react like", () =>
		expect(
			applyReaction(
				{ userReaction: "like", likeCount: 6, dislikeCount: 2 },
				"like",
			),
		).toMatchObject({ userReaction: null, likeCount: 5, dislikeCount: 2 }));
	it("flip to dislike", () =>
		expect(
			applyReaction(
				{ userReaction: "like", likeCount: 6, dislikeCount: 2 },
				"dislike",
			),
		).toMatchObject({
			userReaction: "dislike",
			likeCount: 5,
			dislikeCount: 3,
		}));
});
