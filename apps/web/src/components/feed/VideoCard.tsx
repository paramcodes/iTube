import { Avatar, AvatarFallback, AvatarImage, Badge } from "@itube/ui";
import Link from "next/link";
import * as React from "react";

export interface VideoCardProps {
	video: {
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
	};
}

function formatDuration(seconds: number | null): string {
	if (!seconds) return "0:00";
	const m = Math.floor(seconds / 60);
	const s = seconds % 60;
	return `${m}:${s < 10 ? "0" : ""}${s}`;
}

function formatViews(views: number): string {
	if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M views`;
	if (views >= 1000) return `${(views / 1000).toFixed(1)}K views`;
	return `${views} views`;
}

export default function VideoCard({ video }: VideoCardProps) {
	return (
		<div className="flex flex-col gap-3 group cursor-pointer select-none">
			<Link
				href={`/watch/${video.id}`}
				className="relative aspect-video w-full rounded-2xl overflow-hidden bg-[#272727]"
			>
				{video.thumbnailUrl ? (
					<img
						src={video.thumbnailUrl}
						alt={video.title}
						className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
					/>
				) : (
					<div className="w-full h-full flex items-center justify-center text-xs text-[#888]">
						No Thumbnail
					</div>
				)}
				<div className="absolute bottom-2 right-2">
					<Badge variant="duration">
						{formatDuration(video.durationSeconds)}
					</Badge>
				</div>
			</Link>

			<div className="flex gap-3 items-start px-0.5">
				<Link
					href={`/channel/${video.channel.handle}`}
					className="shrink-0 mt-0.5"
				>
					<Avatar className="w-9 h-9">
						<AvatarImage
							src={video.channel.avatarUrl}
							alt={video.channel.name}
						/>
						<AvatarFallback>{video.channel.name.charAt(0)}</AvatarFallback>
					</Avatar>
				</Link>

				<div className="flex flex-col flex-1 overflow-hidden">
					<Link
						href={`/watch/${video.id}`}
						className="text-[15px] font-medium text-[#f1f1f1] line-clamp-2 leading-snug group-hover:text-white"
					>
						{video.title}
					</Link>
					<Link
						href={`/channel/${video.channel.handle}`}
						className="text-xs text-[#aaa] hover:text-white mt-1 truncate"
					>
						{video.channel.name}
					</Link>
					<div className="text-xs text-[#aaa] mt-0.5">
						{formatViews(video.viewCount)} •{" "}
						{video.publishedAt
							? new Date(video.publishedAt).toLocaleDateString()
							: "Just now"}
					</div>
				</div>
			</div>
		</div>
	);
}
