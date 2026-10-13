import { api } from "@/lib/api";
import { useInfiniteQuery } from "@tanstack/react-query";

interface FeedPage {
	items: Array<{
		id: string;
		title: string;
		thumbnailUrl: string | null;
		viewCount: number;
		likeCount?: number;
		publishedAt: string | null;
		durationSeconds: number | null;
		channel: {
			id: string;
			name: string;
			handle: string;
			avatarUrl?: string | null;
		};
	}>;
	nextCursor?: string | null;
}

export function useFeed(category: string) {
	return useInfiniteQuery({
		queryKey: ["feed", category],
		queryFn: async ({ pageParam }) => {
			const res = await (
				api as unknown as {
					api: {
						feed: {
							get: (params: {
								query: { category: string; cursor?: string };
							}) => Promise<{ data: FeedPage }>;
						};
					};
				}
			).api.feed.get({
				query: {
					category,
					cursor: pageParam ?? undefined,
				},
			});
			return res.data;
		},
		getNextPageParam: (lastPage: FeedPage) => lastPage?.nextCursor ?? undefined,
		initialPageParam: undefined as string | undefined,
	});
}
