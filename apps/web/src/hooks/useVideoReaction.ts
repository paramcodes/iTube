import { api } from "@/lib/api";
import { queryClient } from "@/lib/query-client";
import { useMutation } from "@tanstack/react-query";

export interface VideoReactionState {
	userReaction: "like" | "dislike" | null;
	likeCount: number;
	dislikeCount: number;
}

function applyReaction(
	old: VideoReactionState,
	type: "like" | "dislike",
): VideoReactionState {
	const prev = old.userReaction;
	const removing = prev === type;
	return {
		userReaction: removing ? null : type,
		likeCount:
			old.likeCount +
			(type === "like" && !removing ? 1 : 0) -
			(prev === "like" && (removing || type !== "like") ? 1 : 0),
		dislikeCount:
			old.dislikeCount +
			(type === "dislike" && !removing ? 1 : 0) -
			(prev === "dislike" && (removing || type !== "dislike") ? 1 : 0),
	};
}

export function useVideoReaction(videoId: string) {
	return useMutation({
		mutationFn: async (type: "like" | "dislike") => {
			const client = api as unknown as {
				api: {
					videos: (params: { id: string }) => {
						reactions: {
							post: (body: { type: string }) => Promise<{ data: unknown }>;
						};
					};
				};
			};
			const res = await client.api.videos({ id: videoId }).reactions.post({
				type,
			});
			return res.data;
		},
		onMutate: async (type: "like" | "dislike") => {
			await queryClient.cancelQueries({ queryKey: ["video", videoId] });
			const previous = queryClient.getQueryData<VideoReactionState>([
				"video-reaction",
				videoId,
			]);

			if (previous) {
				queryClient.setQueryData(
					["video-reaction", videoId],
					applyReaction(previous, type),
				);
			}

			return { previous };
		},
		onError: (_err, _vars, context) => {
			if (context?.previous) {
				queryClient.setQueryData(["video-reaction", videoId], context.previous);
			}
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ["video-reaction", videoId] });
			queryClient.invalidateQueries({ queryKey: ["video", videoId] });
		},
	});
}
