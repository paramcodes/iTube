"use client";

import { env } from "@/env";
import { queryClient } from "@/lib/query-client";
import type { CommentDto } from "@itube/types";
import * as React from "react";

interface CommentsData {
	pages: Array<{ items: CommentDto[]; nextCursor?: string | null }>;
	pageParams: Array<string | undefined>;
}

function dedupInsert(items: CommentDto[], incoming: CommentDto): CommentDto[] {
	if (items.some((c) => c.id === incoming.id)) return items;
	return [incoming, ...items];
}

export function useCommentStream(videoId: string) {
	React.useEffect(() => {
		if (!videoId) return;

		const es = new EventSource(
			`${env.NEXT_PUBLIC_API_URL}/api/videos/${videoId}/comments/stream`,
		);

		es.onmessage = (event) => {
			try {
				const parsed = JSON.parse(event.data);
				if (parsed.type === "comment:created" && parsed.comment) {
					const incoming = parsed.comment as CommentDto;
					const current = queryClient.getQueryData<CommentsData>([
						"comments",
						videoId,
					]);

					if (current && current.pages.length > 0) {
						const firstPage = current.pages[0];
						if (firstPage) {
							const updatedFirstPage = {
								...firstPage,
								items: dedupInsert(firstPage.items, incoming),
							};
							queryClient.setQueryData<CommentsData>(["comments", videoId], {
								...current,
								pages: [updatedFirstPage, ...current.pages.slice(1)],
							});
						}
					}
				}
			} catch {
				// SSE heartbeat or parse ignore
			}
		};

		return () => {
			es.close();
		};
	}, [videoId]);
}
