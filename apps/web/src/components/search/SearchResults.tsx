"use client";

import * as React from "react";
import { useSearch } from "../../hooks/useSearch";
import VideoCard from "../feed/VideoCard";

export function SearchResults({ query }: { query: string }) {
	const [page, setPage] = React.useState(1);
	const { data, isLoading } = useSearch(query, page);

	if (isLoading && page === 1) {
		return (
			<div className="flex flex-col gap-4 py-4 max-w-5xl mx-auto animate-pulse">
				{[
					"search-skel-1",
					"search-skel-2",
					"search-skel-3",
					"search-skel-4",
					"search-skel-5",
					"search-skel-6",
				].map((id) => (
					<div key={id} className="flex gap-4">
						<div className="w-80 aspect-video rounded-xl bg-[#272727] shrink-0" />
						<div className="flex flex-col gap-2 flex-1 py-2">
							<div className="h-4 bg-[#272727] rounded w-2/3" />
							<div className="h-3 bg-[#272727] rounded w-1/4" />
							<div className="h-3 bg-[#272727] rounded w-1/2 mt-4" />
						</div>
					</div>
				))}
			</div>
		);
	}

	const items = data?.items || [];

	if (items.length === 0) {
		return (
			<div className="py-16 text-center text-[#888] max-w-xl mx-auto">
				No results found for "{query}". Try different search terms or check
				spelling.
			</div>
		);
	}

	return (
		<div className="max-w-5xl mx-auto py-2 flex flex-col gap-4">
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
				{items.map((video) => (
					<VideoCard key={video.id} video={video} />
				))}
			</div>

			{data?.hasMore && (
				<div className="flex justify-center mt-6">
					<button
						type="button"
						onClick={() => setPage((p) => p + 1)}
						className="px-6 py-2 rounded-full bg-[#272727] text-white text-sm font-medium hover:bg-[#3d3d3d] cursor-pointer"
					>
						Load More Results
					</button>
				</div>
			)}
		</div>
	);
}
