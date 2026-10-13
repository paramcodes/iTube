"use client";

import * as React from "react";
import { AnalyticsDashboard } from "../../../components/studio/AnalyticsDashboard";
import { VideoTable } from "../../../components/studio/VideoTable";
import {
	type StudioVideo,
	useStudioVideos,
} from "../../../hooks/useStudioVideos";

const MOCK_STUDIO_VIDEOS: StudioVideo[] = [
	{
		id: "vid-1",
		title: "Building a Full-Stack YouTube Clone with Next.js 15, Bun & Elysia",
		description: "Full-stack architecture walkthrough of iTube.",
		category: "Tech",
		visibility: "public",
		thumbnailUrl:
			"https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80",
		viewCount: 142850,
		likeCount: 9240,
		dislikeCount: 42,
		commentCount: 84,
		publishedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
		createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
	},
	{
		id: "vid-2",
		title: "How PostgreSQL Full-Text Search tsvector & GIN Indexes Really Work",
		description: "Postgres indexing internals and search performance.",
		category: "Tech",
		visibility: "public",
		thumbnailUrl:
			"https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80",
		viewCount: 88500,
		likeCount: 4500,
		dislikeCount: 18,
		commentCount: 39,
		publishedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
		createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
	},
	{
		id: "vid-3",
		title: "Mux Direct Video Ingestion and Adaptive Bitrate HLS Streaming",
		description: "Video pipeline and player integration.",
		category: "Tech",
		visibility: "unlisted",
		thumbnailUrl:
			"https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800&auto=format&fit=crop&q=80",
		viewCount: 31000,
		likeCount: 1800,
		dislikeCount: 5,
		commentCount: 12,
		publishedAt: new Date(Date.now() - 3600000 * 48).toISOString(),
		createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
	},
];

export default function StudioPage() {
	const { data, updateVideo, deleteVideo } = useStudioVideos();

	const liveVideos = data?.pages?.flatMap((page) => page?.items || []) || [];

	const videos = liveVideos.length > 0 ? liveVideos : MOCK_STUDIO_VIDEOS;

	return (
		<div className="max-w-6xl mx-auto py-4 flex flex-col gap-6">
			<AnalyticsDashboard />

			<VideoTable
				videos={videos}
				onUpdate={async (id, input) => {
					await updateVideo.mutateAsync({ id, input });
				}}
				onDelete={async (id) => {
					await deleteVideo.mutateAsync(id);
				}}
			/>
		</div>
	);
}
