"use client";

import { useParams } from "next/navigation";
import * as React from "react";
import { CommentsSection } from "../../../../components/comments/CommentsSection";
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
	commentCount: number;
	publishedAt: string | null;
	channel: {
		id: string;
		name: string;
		handle: string;
		avatarUrl: string | null;
		subscriberCount: number;
	};
}

const FALLBACK_VIDEO: VideoDetail = {
	id: "vid-1",
	title: "Building a Full-Stack YouTube Clone with Next.js 15, Bun & Elysia",
	description:
		"In this comprehensive masterclass, we dive deep into the full-stack architecture of iTube: Bun workspaces, Elysia backend on Bun, Drizzle ORM + PostgreSQL 18 with tsvector full-text search, Upstash Redis debouncing 100K views, and pixel-accurate YouTube dark theme design tokens built with Shadcn UI & Tailwind CSS v4.",
	muxPlaybackId: "A32010170068",
	viewCount: 142850,
	likeCount: 9240,
	dislikeCount: 42,
	commentCount: 84,
	publishedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
	channel: {
		id: "ch-1",
		name: "Tech Architect",
		handle: "techarchitect",
		avatarUrl:
			"https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
		subscriberCount: 248000,
	},
};

export default function WatchPage() {
	const params = useParams();
	const videoId = (params?.videoId as string) || "vid-1";

	const [video, setVideo] = React.useState<VideoDetail>(FALLBACK_VIDEO);

	useWatchProgress(videoId);

	React.useEffect(() => {
		if (!videoId) return;
		fetch(`${env.NEXT_PUBLIC_API_URL}/api/videos/${videoId}`)
			.then((r) => (r.ok ? r.json() : null))
			.then((data) => {
				if (data?.title) {
					setVideo(data);
				}
			})
			.catch(() => {});
	}, [videoId]);

	return (
		<div className="max-w-6xl mx-auto py-2 flex flex-col gap-6">
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

				<div className="flex items-center justify-between border-b border-[rgba(255,255,255,0.1)] pb-4">
					<div className="flex items-center gap-3">
						<div className="w-10 h-10 rounded-full bg-[#3d3d3d] flex items-center justify-center font-bold text-white overflow-hidden border border-[rgba(255,255,255,0.1)]">
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
								{video.channel.subscriberCount.toLocaleString()} subscribers
							</span>
						</div>
					</div>

					<div className="text-sm text-[#aaa]">
						{video.viewCount.toLocaleString()} views
					</div>
				</div>

				{video.description && (
					<div className="bg-[#212121] rounded-2xl p-4 text-sm text-[#f1f1f1] whitespace-pre-wrap leading-relaxed border border-[rgba(255,255,255,0.06)]">
						{video.description}
					</div>
				)}
			</div>

			<CommentsSection videoId={video.id} commentCount={video.commentCount} />
		</div>
	);
}
