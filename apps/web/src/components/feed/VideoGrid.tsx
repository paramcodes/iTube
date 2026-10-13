"use client";

import * as React from "react";
import VideoCard, { type VideoCardProps } from "./VideoCard";

interface VideoPage {
	items: VideoCardProps["video"][];
}

export interface VideoGridProps {
	data: { pages?: VideoPage[] } | undefined;
	isLoading: boolean;
	isFetchingNextPage: boolean;
	hasNextPage?: boolean;
	fetchNextPage: () => void;
}

export function VideoGrid({
	data,
	isLoading,
	isFetchingNextPage,
	hasNextPage,
	fetchNextPage,
}: VideoGridProps) {
	const sentinelRef = React.useRef<HTMLDivElement>(null);

	React.useEffect(() => {
		if (!hasNextPage || isFetchingNextPage) return;

		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0]?.isIntersecting) {
					fetchNextPage();
				}
			},
			{ threshold: 0.1 },
		);

		if (sentinelRef.current) {
			observer.observe(sentinelRef.current);
		}

		return () => observer.disconnect();
	}, [hasNextPage, isFetchingNextPage, fetchNextPage]);

	const videos = data?.pages?.flatMap((page) => page?.items || []) || [];

	if (isLoading && videos.length === 0) {
		return (
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 py-4">
				{[
					"skel-1",
					"skel-2",
					"skel-3",
					"skel-4",
					"skel-5",
					"skel-6",
					"skel-7",
					"skel-8",
				].map((id) => (
					<div key={id} className="flex flex-col gap-3 animate-pulse">
						<div className="aspect-video w-full rounded-xl bg-[#272727]" />
						<div className="flex gap-3">
							<div className="w-9 h-9 rounded-full bg-[#272727] shrink-0" />
							<div className="flex flex-col gap-2 flex-1">
								<div className="h-4 bg-[#272727] rounded w-3/4" />
								<div className="h-3 bg-[#272727] rounded w-1/2" />
							</div>
						</div>
					</div>
				))}
			</div>
		);
	}

	return (
		<div className="py-2">
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8">
				{videos.map((video) => (
					<VideoCard key={video.id} video={video} />
				))}
			</div>

			<div
				ref={sentinelRef}
				className="h-10 flex items-center justify-center mt-6"
			>
				{isFetchingNextPage && (
					<div className="text-xs text-[#888]">Loading more videos...</div>
				)}
			</div>
		</div>
	);
}
