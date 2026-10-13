import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import VideoCard from "../components/feed/VideoCard";

const mockVideo = {
	id: "v1",
	title: "Test Video",
	thumbnailUrl: "https://image.mux.com/abc/thumbnail.webp",
	viewCount: 1234,
	likeCount: 10,
	publishedAt: new Date().toISOString(),
	durationSeconds: 312,
	channel: { id: "c1", name: "Test Channel", handle: "test", avatarUrl: "" },
};

describe("VideoCard", () => {
	it("renders title and channel name", () => {
		const html = renderToStaticMarkup(<VideoCard video={mockVideo} />);
		expect(html).toContain("Test Video");
		expect(html).toContain("Test Channel");
	});
	it("formats duration as mm:ss", () => {
		const html = renderToStaticMarkup(<VideoCard video={mockVideo} />);
		expect(html).toContain("5:12");
	});
});
