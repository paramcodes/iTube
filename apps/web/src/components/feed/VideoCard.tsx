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
				className="relative aspect-video w-full rounded-xl overflow-hidden bg-[#272727]"
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
				<div className="absolute bottom-1.5 right-1.5 bg-black/80 text-white text-[11px] font-medium px-1.5 py-0.5 rounded">
					{formatDuration(video.durationSeconds)}
				</div>
			</Link>

			<div className="flex gap-3 items-start px-0.5">
				<div className="w-9 h-9 rounded-full bg-[#3d3d3d] overflow-hidden shrink-0 flex items-center justify-center text-xs font-bold text-white">
					{video.channel.avatarUrl ? (
						<img
							src={video.channel.avatarUrl}
							alt={video.channel.name}
							className="w-full h-full object-cover"
						/>
					) : (
						video.channel.name.charAt(0)
					)}
				</div>

				<div className="flex flex-col flex-1 overflow-hidden">
					<Link
						href={`/watch/${video.id}`}
						className="text-sm font-semibold text-[#f1f1f1] line-clamp-2 leading-snug group-hover:text-white"
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
						{formatViews(video.viewCount)}
					</div>
				</div>
			</div>
		</div>
	);
}
