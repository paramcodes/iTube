"use client";

import * as React from "react";
import { useCommentStream } from "../../hooks/useCommentStream";
import { useComments } from "../../hooks/useComments";
import { CommentComposer } from "./CommentComposer";
import { CommentThread } from "./CommentThread";

export function CommentsSection({
	videoId,
	commentCount,
}: {
	videoId: string;
	commentCount: number;
}) {
	useCommentStream(videoId);
	const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } =
		useComments(videoId);

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

	const comments = data?.pages?.flatMap((page) => page?.items || []) || [];

	return (
		<div className="flex flex-col gap-6 pt-4 border-t border-[#272727]">
			<div className="flex items-center gap-6">
				<h2 className="text-lg font-bold text-white">
					{commentCount.toLocaleString()} Comments
				</h2>
			</div>

			<CommentComposer videoId={videoId} />

			{isLoading && comments.length === 0 ? (
				<div className="text-sm text-[#888] py-4">Loading comments...</div>
			) : (
				<div className="flex flex-col gap-2">
					{comments.map((comment) => (
						<CommentThread key={comment.id} comment={comment} />
					))}
				</div>
			)}

			<div ref={sentinelRef} className="h-6 flex items-center justify-center">
				{isFetchingNextPage && (
					<div className="text-xs text-[#888]">Loading more comments...</div>
				)}
			</div>
		</div>
	);
}
