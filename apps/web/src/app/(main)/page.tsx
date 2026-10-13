"use client";

import * as React from "react";
import { CategoryCarousel } from "../../components/feed/CategoryCarousel";
import { VideoGrid } from "../../components/feed/VideoGrid";
import { useFeed } from "../../hooks/useFeed";

const CATEGORIES = [
	"All",
	"Music",
	"Gaming",
	"Podcasts",
	"Tech",
	"News",
	"Education",
	"Entertainment",
	"Science",
];

export default function HomePage() {
	const [category, setCategory] = React.useState("All");
	const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } =
		useFeed(category);

	return (
		<div className="flex flex-col min-h-screen">
			<CategoryCarousel
				categories={CATEGORIES}
				active={category}
				onChange={setCategory}
			/>
			<VideoGrid
				data={data}
				isLoading={isLoading}
				isFetchingNextPage={isFetchingNextPage}
				hasNextPage={hasNextPage}
				fetchNextPage={fetchNextPage}
			/>
		</div>
	);
}
