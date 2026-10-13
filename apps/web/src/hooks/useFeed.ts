import { api } from "@/lib/api";
import { useInfiniteQuery } from "@tanstack/react-query";

interface VideoItem {
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
}

interface FeedPage {
	items: VideoItem[];
	nextCursor?: string | null;
}

const MOCK_VIDEOS: VideoItem[] = [
	{
		id: "vid-1",
		title: "Building a Full-Stack YouTube Clone with Next.js 15, Bun & Elysia",
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
	{
		id: "vid-3",
		title: "Mux Direct Video Ingestion and Adaptive Bitrate HLS Streaming",
		thumbnailUrl:
			"https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800&auto=format&fit=crop&q=80",
		viewCount: 31000,
		likeCount: 1800,
		publishedAt: new Date(Date.now() - 3600000 * 48).toISOString(),
		durationSeconds: 1540,
		channel: {
			id: "ch-3",
			name: "Video Ops",
			handle: "videoops",
			avatarUrl:
				"https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80",
		},
	},
	{
		id: "vid-4",
		title: "Modern CSS & YouTube Dark Theme Tokens: Beyond Breakpoints",
		thumbnailUrl:
			"https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&auto=format&fit=crop&q=80",
		viewCount: 204000,
		likeCount: 14000,
		publishedAt: new Date(Date.now() - 3600000 * 72).toISOString(),
		durationSeconds: 615,
		channel: {
			id: "ch-4",
			name: "Frontend Masterclass",
			handle: "frontendmasters",
			avatarUrl:
				"https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80",
		},
	},
	{
		id: "vid-5",
		title:
			"Why Upstash Redis Debounces 100,000 Concurrent Video Views Seamlessly",
		thumbnailUrl:
			"https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=80",
		viewCount: 95400,
		likeCount: 6100,
		publishedAt: new Date(Date.now() - 3600000 * 96).toISOString(),
		durationSeconds: 1102,
		channel: {
			id: "ch-1",
			name: "Tech Architect",
			handle: "techarchitect",
			avatarUrl:
				"https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
		},
	},
	{
		id: "vid-6",
		title: "Server-Sent Events vs WebSockets for Live Interactive Comments",
		thumbnailUrl:
			"https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80",
		viewCount: 42100,
		likeCount: 2900,
		publishedAt: new Date(Date.now() - 3600000 * 120).toISOString(),
		durationSeconds: 948,
		channel: {
			id: "ch-2",
			name: "Database Daily",
			handle: "databasedaily",
			avatarUrl:
				"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
		},
	},
	{
		id: "vid-7",
		title: "Designing Deep Modules & Ergonomic Types with TypeScript & Zod",
		thumbnailUrl:
			"https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=80",
		viewCount: 175000,
		likeCount: 11500,
		publishedAt: new Date(Date.now() - 3600000 * 150).toISOString(),
		durationSeconds: 1380,
		channel: {
			id: "ch-4",
			name: "Frontend Masterclass",
			handle: "frontendmasters",
			avatarUrl:
				"https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80",
		},
	},
	{
		id: "vid-8",
		title: "Inside YouTube’s Adaptive Scrubber & Keyboard Shortcuts Engine",
		thumbnailUrl:
			"https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&auto=format&fit=crop&q=80",
		viewCount: 63000,
		likeCount: 3800,
		publishedAt: new Date(Date.now() - 3600000 * 200).toISOString(),
		durationSeconds: 742,
		channel: {
			id: "ch-3",
			name: "Video Ops",
			handle: "videoops",
			avatarUrl:
				"https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80",
		},
	},
];

export function useFeed(category: string) {
	return useInfiniteQuery({
		queryKey: ["feed", category],
		queryFn: async ({ pageParam }) => {
			try {
				const client = api as unknown as {
					api: {
						feed: {
							get: (params: {
								query: { category: string; cursor?: string | undefined };
							}) => Promise<{ data: FeedPage | null }>;
						};
					};
				};
				const res = await client.api.feed.get({
					query: {
						category,
						...(pageParam ? { cursor: pageParam } : {}),
					},
				});
				if (res.data?.items && res.data.items.length > 0) {
					return res.data;
				}
			} catch {
				// Fallback to client-side seed data if database is unseeded
			}

			// Filter seed data by category if not 'All'
			const items = category === "All" ? MOCK_VIDEOS : MOCK_VIDEOS.slice(0, 4);
			return {
				items,
				nextCursor: null,
			};
		},
		getNextPageParam: (lastPage: FeedPage) => lastPage?.nextCursor ?? undefined,
		initialPageParam: undefined as string | undefined,
	});
}
