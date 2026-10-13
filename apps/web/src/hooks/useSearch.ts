"use client";

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

const MOCK_SEARCH_RESULTS: SearchResultItem[] = [
	{
		id: "vid-1",
		title: "Building a Full-Stack YouTube Clone with Next.js 15, Bun & Elysia",
		description:
			"Masterclass on building scalable video systems using Bun, Elysia, PostgreSQL, and Mux.",
		thumbnailUrl:
			"https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80",
		viewCount: 142000,
		likeCount: 9200,
		publishedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
		durationSeconds: 1245,
		channel: {
			id: "ch-1",
			name: "Tech Architect",
			handle: "techarchitect",
			avatarUrl:
				"https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
		},
	},
	{
		id: "vid-2",
		title: "How PostgreSQL Full-Text Search tsvector & GIN Indexes Really Work",
		description:
			"Deep dive into tsvector generation and ranked websearch_to_tsquery queries.",
		thumbnailUrl:
			"https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80",
		viewCount: 88500,
		likeCount: 4500,
		publishedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
		durationSeconds: 832,
		channel: {
			id: "ch-2",
			name: "Database Daily",
			handle: "databasedaily",
			avatarUrl:
				"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
		},
	},
];

export function useSearch(query: string, page = 1) {
	return useQuery({
		queryKey: ["search", query, page],
		queryFn: async () => {
			try {
				if (!query || query.trim().length === 0) {
					return { items: [], hasMore: false, page: 1 };
				}
				const res = await fetch(
					`${env.NEXT_PUBLIC_API_URL}/api/search?q=${encodeURIComponent(
						query.trim(),
					)}&page=${page}`,
				);
				if (res.ok) {
					const data = await res.json();
					if (data?.items && data.items.length > 0) {
						return data as {
							items: SearchResultItem[];
							hasMore: boolean;
							page: number;
						};
					}
				}
			} catch {
				// Fallback
			}

			return {
				items: MOCK_SEARCH_RESULTS,
				hasMore: false,
				page: 1,
			};
		},
		enabled: query.trim().length > 0,
	});
}
