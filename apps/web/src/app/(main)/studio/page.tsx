"use client";

import * as React from "react";
import { AnalyticsDashboard } from "../../../components/studio/AnalyticsDashboard";
import { VideoTable } from "../../../components/studio/VideoTable";
import { useStudioVideos } from "../../../hooks/useStudioVideos";

export default function StudioPage() {
	const { data, isLoading, updateVideo, deleteVideo } = useStudioVideos();

	const videos = data?.pages?.flatMap((page) => page?.items || []) || [];

	return (
		<div className="max-w-6xl mx-auto py-4 flex flex-col gap-6">
			<AnalyticsDashboard />

			{isLoading && videos.length === 0 ? (
				<div className="text-sm text-[#888] py-8 text-center">
					Loading studio content...
				</div>
			) : (
				<VideoTable
					videos={videos}
					onUpdate={async (id, input) => {
						await updateVideo.mutateAsync({ id, input });
					}}
					onDelete={async (id) => {
						await deleteVideo.mutateAsync(id);
					}}
				/>
			)}
		</div>
	);
}
