import { env } from "@/env";
import { queryClient } from "@/lib/query-client";
import { useInfiniteQuery, useMutation } from "@tanstack/react-query";

export interface StudioVideo {
	id: string;
	title: string;
	description?: string | null;
	category?: string | null;
	visibility: "public" | "unlisted" | "private" | "scheduled";
	muxPlaybackId?: string | null;
	thumbnailUrl?: string | null;
	viewCount: number;
	likeCount: number;
	dislikeCount: number;
	commentCount: number;
	publishedAt?: string | null;
	createdAt: string;
}

export function useStudioVideos(visibility?: string) {
	const query = useInfiniteQuery({
		queryKey: ["studio-videos", visibility],
		queryFn: async ({ pageParam }) => {
			const url = new URL(`${env.NEXT_PUBLIC_API_URL}/api/studio/videos`);
			if (visibility) url.searchParams.set("visibility", visibility);
			if (pageParam) url.searchParams.set("cursor", pageParam);

			const res = await fetch(url.toString(), {
				headers: {
					Authorization: "Bearer test_token",
				},
			});
			if (!res.ok) throw new Error("Failed to fetch studio videos");
			return (await res.json()) as {
				items: StudioVideo[];
				nextCursor?: string | null;
			};
		},
		getNextPageParam: (lastPage) => lastPage?.nextCursor ?? undefined,
		initialPageParam: undefined as string | undefined,
	});

	const updateMutation = useMutation({
		mutationFn: async ({
			id,
			input,
		}: {
			id: string;
			input: Partial<StudioVideo>;
		}) => {
			const res = await fetch(
				`${env.NEXT_PUBLIC_API_URL}/api/studio/videos/${id}`,
				{
					method: "PATCH",
					headers: {
						"Content-Type": "application/json",
						Authorization: "Bearer test_token",
					},
					body: JSON.stringify(input),
				},
			);
			if (!res.ok) throw new Error("Failed to update video");
			return await res.json();
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ["studio-videos"] });
		},
	});

	const deleteMutation = useMutation({
		mutationFn: async (id: string) => {
			const res = await fetch(
				`${env.NEXT_PUBLIC_API_URL}/api/studio/videos/${id}`,
				{
					method: "DELETE",
					headers: {
						Authorization: "Bearer test_token",
					},
				},
			);
			if (!res.ok) throw new Error("Failed to delete video");
			return true;
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ["studio-videos"] });
		},
	});

	return {
		...query,
		updateVideo: updateMutation,
		deleteVideo: deleteMutation,
	};
}
