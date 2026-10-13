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

export default function ChannelPage() {
	const params = useParams();
	const handle = params?.handle as string;

	const [channel, setChannel] = React.useState<ChannelData | null>(null);
	const [videos, setVideos] = React.useState<ChannelVideo[]>([]);
	const [loading, setLoading] = React.useState(true);

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
				setChannel(channelData);
				setVideos(videosData.items || []);
				setLoading(false);
			})
			.catch(() => setLoading(false));
	}, [handle]);

	if (loading) {
		return (
			<div className="max-w-6xl mx-auto py-4 flex flex-col gap-6 animate-pulse">
				<div className="w-full h-48 bg-[#272727] rounded-2xl" />
				<div className="flex gap-4 items-center">
					<div className="w-24 h-24 rounded-full bg-[#272727]" />
					<div className="flex flex-col gap-2 flex-1">
						<div className="h-6 bg-[#272727] rounded w-1/4" />
						<div className="h-4 bg-[#272727] rounded w-1/6" />
					</div>
				</div>
			</div>
		);
	}

	if (!channel) {
		return (
			<div className="max-w-6xl mx-auto py-12 text-center text-[#888]">
				Channel not found.
			</div>
		);
	}

	return (
		<div className="max-w-6xl mx-auto py-4 flex flex-col gap-8">
			<ChannelHeader channel={channel} />

			<div className="border-t border-[#272727] pt-6">
				<h2 className="text-lg font-bold text-white mb-4">Videos</h2>

				{videos.length === 0 ? (
					<div className="py-12 text-center text-[#888]">
						This channel has not uploaded any public videos yet.
					</div>
				) : (
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
						{videos.map((video) => (
							<VideoCard key={video.id} video={video} />
						))}
					</div>
				)}
			</div>
		</div>
	);
}
