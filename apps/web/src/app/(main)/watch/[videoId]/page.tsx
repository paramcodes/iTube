"use client";

import { useParams } from "next/navigation";
import * as React from "react";
import { VideoPlayer } from "../../../../components/player/VideoPlayer";
import { env } from "../../../../env";
import { useWatchProgress } from "../../../../hooks/useWatchProgress";

interface VideoDetail {
	id: string;
	title: string;
	description: string | null;
	muxPlaybackId: string | null;
	viewCount: number;
	likeCount: number;
	dislikeCount: number;
	publishedAt: string | null;
	channel: {
		id: string;
		name: string;
		handle: string;
		avatarUrl: string | null;
		subscriberCount: number;
	};
}

export default function WatchPage() {
	const params = useParams();
	const videoId = params?.videoId as string;

	const [video, setVideo] = React.useState<VideoDetail | null>(null);
	const [loading, setLoading] = React.useState(true);

	useWatchProgress(videoId);

	React.useEffect(() => {
		if (!videoId) return;
		fetch(`${env.NEXT_PUBLIC_API_URL}/api/videos/${videoId}`)
			.then((r) => r.json())
			.then((data) => {
				setVideo(data);
				setLoading(false);
			})
			.catch(() => setLoading(false));
	}, [videoId]);

	if (loading) {
		return (
			<div className="max-w-6xl mx-auto py-4 flex flex-col gap-4 animate-pulse">
				<div className="aspect-video w-full rounded-xl bg-[#272727]" />
				<div className="h-6 bg-[#272727] rounded w-2/3" />
				<div className="h-4 bg-[#272727] rounded w-1/3" />
			</div>
		);
	}

	if (!video) {
		return (
			<div className="max-w-6xl mx-auto py-12 text-center text-[#888]">
				Video not found.
			</div>
		);
	}

	return (
		<div className="max-w-6xl mx-auto py-2 flex flex-col gap-4">
			<VideoPlayer
				videoId={video.id}
				playbackId={video.muxPlaybackId}
				title={video.title}
				likeCount={video.likeCount}
				dislikeCount={video.dislikeCount}
			/>

			<div className="flex flex-col gap-3">
				<h1 className="text-xl font-bold text-white leading-tight">
					{video.title}
				</h1>

				<div className="flex items-center justify-between border-b border-[#272727] pb-4">
					<div className="flex items-center gap-3">
						<div className="w-10 h-10 rounded-full bg-[#3d3d3d] flex items-center justify-center font-bold text-white overflow-hidden">
							{video.channel.avatarUrl ? (
								<img
									src={video.channel.avatarUrl}
									alt={video.channel.name}
									className="w-full h-full object-cover"
								/>
							) : (
								video.channel.name.charAt(0)
							)}
						</div>
						<div className="flex flex-col">
							<span className="font-semibold text-sm text-white">
								{video.channel.name}
							</span>
							<span className="text-xs text-[#aaa]">
								{video.channel.subscriberCount} subscribers
							</span>
						</div>
					</div>

					<div className="text-sm text-[#aaa]">
						{video.viewCount.toLocaleString()} views
					</div>
				</div>

				{video.description && (
					<div className="bg-[#272727] rounded-xl p-3 text-sm text-[#f1f1f1] whitespace-pre-wrap leading-relaxed">
						{video.description}
					</div>
				)}
			</div>
		</div>
	);
}
