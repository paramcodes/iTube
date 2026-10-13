"use client";

import * as React from "react";
import { useVideoReaction } from "../../hooks/useVideoReaction";

export interface PlayerControlsProps {
	videoId: string;
	isPlaying: boolean;
	onTogglePlay: () => void;
	currentTime: number;
	duration: number;
	onSeek: (time: number) => void;
	isMuted: boolean;
	onToggleMute: () => void;
	isTheater: boolean;
	onToggleTheater: () => void;
	onToggleFullscreen: () => void;
	likeCount: number;
	dislikeCount: number;
}

function formatTime(secs: number): string {
	const m = Math.floor(secs / 60);
	const s = Math.floor(secs % 60);
	return `${m}:${s < 10 ? "0" : ""}${s}`;
}

export function PlayerControls({
	videoId,
	isPlaying,
	onTogglePlay,
	currentTime,
	duration,
	onSeek,
	isMuted,
	onToggleMute,
	isTheater,
	onToggleTheater,
	onToggleFullscreen,
	likeCount,
	dislikeCount,
}: PlayerControlsProps) {
	const reactionMutation = useVideoReaction(videoId);

	return (
		<div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 flex flex-col gap-2 opacity-0 hover:opacity-100 focus-within:opacity-100 transition-opacity select-none">
			<input
				type="range"
				min={0}
				max={duration || 100}
				value={currentTime}
				onChange={(e) => onSeek(Number(e.target.value))}
				className="w-full h-1 accent-[#ff0000] cursor-pointer"
				aria-label="Seek video"
			/>

			<div className="flex items-center justify-between text-white text-xs">
				<div className="flex items-center gap-3">
					<button
						type="button"
						onClick={onTogglePlay}
						className="p-1 hover:text-[#ff0000] cursor-pointer"
					>
						{isPlaying ? "⏸" : "▶"}
					</button>
					<button
						type="button"
						onClick={onToggleMute}
						className="p-1 hover:text-[#ff0000] cursor-pointer"
					>
						{isMuted ? "🔇" : "🔊"}
					</button>
					<span>
						{formatTime(currentTime)} / {formatTime(duration)}
					</span>
				</div>

				<div className="flex items-center gap-3">
					<div className="flex items-center bg-[#272727] rounded-full overflow-hidden text-xs">
						<button
							type="button"
							onClick={() => reactionMutation.mutate("like")}
							className="px-2.5 py-1 hover:bg-[#3d3d3d] flex items-center gap-1 cursor-pointer"
						>
							<span>👍</span>
							<span>{likeCount}</span>
						</button>
						<div className="w-[1px] h-3 bg-[#444]" />
						<button
							type="button"
							onClick={() => reactionMutation.mutate("dislike")}
							className="px-2.5 py-1 hover:bg-[#3d3d3d] flex items-center gap-1 cursor-pointer"
						>
							<span>👎</span>
							{dislikeCount > 0 && <span>{dislikeCount}</span>}
						</button>
					</div>

					<button
						type="button"
						onClick={onToggleTheater}
						className="p-1 hover:text-[#ff0000] cursor-pointer"
						title="Theater mode (t)"
					>
						{isTheater ? "🔲" : "🔳"}
					</button>
					<button
						type="button"
						onClick={onToggleFullscreen}
						className="p-1 hover:text-[#ff0000] cursor-pointer"
						title="Fullscreen (f)"
					>
						⛶
					</button>
				</div>
			</div>
		</div>
	);
}
