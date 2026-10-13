import { env } from "@/env";
import { useQuery } from "@tanstack/react-query";

export interface SearchResultItem {
	id: string;
	title: string;
	description?: string;
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

export function useSearch(query: string, page = 1) {
	return useQuery({
		queryKey: ["search", query, page],
		queryFn: async () => {
			if (!query || query.trim().length === 0) {
				return { items: [], hasMore: false, page: 1 };
			}
			const res = await fetch(
				`${env.NEXT_PUBLIC_API_URL}/api/search?q=${encodeURIComponent(
					query.trim(),
				)}&page=${page}`,
			);
			if (!res.ok) return { items: [], hasMore: false, page: 1 };
			return (await res.json()) as {
				items: SearchResultItem[];
				hasMore: boolean;
				page: number;
			};
		},
		enabled: query.trim().length > 0,
	});
}
