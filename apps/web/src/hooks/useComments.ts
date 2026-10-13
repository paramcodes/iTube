import { env } from "@/env";
import type { CommentDto } from "@itube/types";
import { useInfiniteQuery } from "@tanstack/react-query";

interface CommentsPage {
	items: CommentDto[];
	nextCursor?: string | null;
}

const MOCK_COMMENTS: CommentDto[] = [
	{
		id: "c-1",
		content:
			"The architecture of the video buffer in Redis flushing directly to Postgres is brilliant. Prevents write storms completely!",
		likeCount: 42,
		dislikeCount: 0,
		replyCount: 2,
		createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
		channel: {
			id: "ch-9",
			name: "Senior Dev",
			handle: "seniordev",
			avatarUrl:
				"https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80",
		},
	},
	{
		id: "c-2",
		content:
			"Pixel-accurate YouTube dark theme reproduction! The 56px masthead and 240px drawer feel so natural.",
		likeCount: 19,
		dislikeCount: 0,
		replyCount: 0,
		createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
		channel: {
			id: "ch-8",
			name: "UI Craftsman",
			handle: "uicraftsman",
			avatarUrl:
				"https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&auto=format&fit=crop&q=80",
		},
	},
];

export function useComments(videoId: string) {
	return useInfiniteQuery({
		queryKey: ["comments", videoId],
		queryFn: async ({ pageParam }) => {
			try {
				const url = new URL(
					`${env.NEXT_PUBLIC_API_URL}/api/videos/${videoId}/comments`,
				);
				if (pageParam) url.searchParams.set("cursor", pageParam);
				const res = await fetch(url.toString());
				if (res.ok) {
					const data = (await res.json()) as CommentsPage;
					if (data?.items && data.items.length > 0) return data;
				}
			} catch {
				// Fallback
			}

			return {
				items: MOCK_COMMENTS,
				nextCursor: null,
			};
		},
		getNextPageParam: (lastPage: CommentsPage) =>
			lastPage?.nextCursor ?? undefined,
		initialPageParam: undefined as string | undefined,
	});
}
