import { env } from "@/env";
import { queryClient } from "@/lib/query-client";
import type { CommentDto } from "@itube/types";
import { useMutation } from "@tanstack/react-query";

interface CommentsData {
	pages: Array<{ items: CommentDto[]; nextCursor?: string | null }>;
	pageParams: Array<string | undefined>;
}

export function usePostComment(videoId: string) {
	return useMutation({
		mutationFn: async ({
			content,
			parentId,
		}: {
			content: string;
			parentId?: string;
		}) => {
			const res = await fetch(
				`${env.NEXT_PUBLIC_API_URL}/api/videos/${videoId}/comments`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ content, parentId }),
				},
			);
			if (!res.ok) throw new Error("Failed to post comment");
			return (await res.json()) as CommentDto;
		},
		onMutate: async ({ content, parentId }) => {
			if (parentId) return;

			await queryClient.cancelQueries({ queryKey: ["comments", videoId] });
			const previous = queryClient.getQueryData<CommentsData>([
				"comments",
				videoId,
			]);

			if (previous && previous.pages.length > 0) {
				const optimisticComment: CommentDto = {
					id: `temp-${Date.now()}`,
					content,
					likeCount: 0,
					dislikeCount: 0,
					replyCount: 0,
					createdAt: new Date().toISOString(),
					channel: {
						id: "self",
						name: "You",
						handle: "you",
						avatarUrl: null,
					},
				};

				const firstPage = previous.pages[0];
				if (firstPage) {
					const updatedFirstPage = {
						...firstPage,
						items: [optimisticComment, ...firstPage.items],
					};
					queryClient.setQueryData<CommentsData>(["comments", videoId], {
						...previous,
						pages: [updatedFirstPage, ...previous.pages.slice(1)],
					});
				}
			}

			return { previous };
		},
		onError: (_err, _vars, context) => {
			if (context?.previous) {
				queryClient.setQueryData(["comments", videoId], context.previous);
			}
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ["comments", videoId] });
		},
	});
}
