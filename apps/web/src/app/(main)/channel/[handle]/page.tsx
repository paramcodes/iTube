"use client";

import { useParams } from "next/navigation";
import * as React from "react";
import { ChannelHeader } from "../../../../components/channel/ChannelHeader";
import VideoCard from "../../../../components/feed/VideoCard";
import { env } from "../../../../env";

interface ChannelData {
	id: string;
	name: string;
	handle: string;
	avatarUrl: string | null;
	bannerUrl: string | null;
	description: string | null;
	subscriberCount: number;
}

interface ChannelVideo {
	id: string;
	title: string;
	muxPlaybackId: string | null;
	thumbnailUrl: string | null;
	viewCount: number;
	likeCount: number;
	publishedAt: string | null;
	durationSeconds: number | null;
	channel: {
		id: string;
		name: string;
		handle: string;
		avatarUrl: string | null;
	};
}

const FALLBACK_CHANNEL: ChannelData = {
	id: "ch-1",
	name: "Tech Architect",
	handle: "techarchitect",
	avatarUrl:
		"https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
	bannerUrl:
		"https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1600&auto=format&fit=crop&q=80",
	description:
		"Deep architectural breakdowns of modern full-stack web applications, distributed systems, video delivery pipelines, and production engineering practices.",
	subscriberCount: 248000,
};

const FALLBACK_VIDEOS: ChannelVideo[] = [
	{
		id: "vid-1",
		title: "Building a Full-Stack YouTube Clone with Next.js 15, Bun & Elysia",
		thumbnailUrl:
			"https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80",
		muxPlaybackId: "demo-1",
		viewCount: 142000,
		likeCount: 9200,
		publishedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
		durationSeconds: 1245,
		channel: FALLBACK_CHANNEL,
	},
	{
		id: "vid-5",
		title:
			"Why Upstash Redis Debounces 100,000 Concurrent Video Views Seamlessly",
		thumbnailUrl:
			"https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=80",
		muxPlaybackId: "demo-5",
		viewCount: 95400,
		likeCount: 6100,
		publishedAt: new Date(Date.now() - 3600000 * 96).toISOString(),
		durationSeconds: 1102,
		channel: FALLBACK_CHANNEL,
	},
];

export default function ChannelPage() {
	const params = useParams();
	const handle = (params?.handle as string) || "techarchitect";

	const [channel, setChannel] = React.useState<ChannelData>(FALLBACK_CHANNEL);
	const [videos, setVideos] = React.useState<ChannelVideo[]>(FALLBACK_VIDEOS);

	React.useEffect(() => {
		if (!handle) return;

		Promise.all([
			fetch(`${env.NEXT_PUBLIC_API_URL}/api/channels/${handle}`).then((r) =>
				r.ok ? r.json() : null,
			),
			fetch(`${env.NEXT_PUBLIC_API_URL}/api/channels/${handle}/videos`).then(
				(r) => (r.ok ? r.json() : { items: [] }),
			),
		])
			.then(([channelData, videosData]) => {
				if (channelData) setChannel(channelData);
				if (videosData?.items && videosData.items.length > 0)
					setVideos(videosData.items);
			})
			.catch(() => {});
	}, [handle]);

	return (
		<div className="max-w-6xl mx-auto py-4 flex flex-col gap-8">
			<ChannelHeader channel={channel} />

			<div className="border-t border-[rgba(255,255,255,0.1)] pt-6">
				<h2 className="text-lg font-bold text-white mb-4">Videos</h2>

				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
					{videos.map((video) => (
						<VideoCard key={video.id} video={video} />
					))}
				</div>
			</div>
		</div>
	);
}
