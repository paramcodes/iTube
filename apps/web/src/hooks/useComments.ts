import { env } from "@/env";
import type { CommentDto } from "@itube/types";
import { useInfiniteQuery } from "@tanstack/react-query";

interface CommentsPage {
	items: CommentDto[];
	nextCursor?: string | null;
}

export function useComments(videoId: string) {
	return useInfiniteQuery({
		queryKey: ["comments", videoId],
		queryFn: async ({ pageParam }) => {
			const url = new URL(
				`${env.NEXT_PUBLIC_API_URL}/api/videos/${videoId}/comments`,
			);
			if (pageParam) url.searchParams.set("cursor", pageParam);
			const res = await fetch(url.toString());
			return (await res.json()) as CommentsPage;
		},
		getNextPageParam: (lastPage: CommentsPage) =>
			lastPage?.nextCursor ?? undefined,
		initialPageParam: undefined as string | undefined,
	});
}
