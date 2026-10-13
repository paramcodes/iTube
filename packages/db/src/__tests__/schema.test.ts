import { describe, expect, it } from "bun:test";
import {
	channelStatsDaily,
	channels,
	commentReactions,
	comments,
	playlistVideos,
	playlists,
	subscriptions,
	users,
	videoReactions,
	videos,
	watchHistory,
} from "../schema/index";

describe("schema exports", () => {
	it("exports all tables", () => {
		expect(users).toBeDefined();
		expect(channels).toBeDefined();
		expect(videos).toBeDefined();
		expect(comments).toBeDefined();
		expect(subscriptions).toBeDefined();
		expect(videoReactions).toBeDefined();
		expect(commentReactions).toBeDefined();
		expect(playlists).toBeDefined();
		expect(playlistVideos).toBeDefined();
		expect(watchHistory).toBeDefined();
		expect(channelStatsDaily).toBeDefined();
	});
});
