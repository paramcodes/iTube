"use client";

import { Button } from "@itube/ui";
import {
	Maximize,
	Minimize,
	Pause,
	Play,
	RotateCcw,
	Square,
	ThumbsDown,
	ThumbsUp,
	Volume2,
	VolumeX,
} from "lucide-react";
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
		<div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent px-4 pb-3 pt-8 flex flex-col gap-2 opacity-0 hover:opacity-100 focus-within:opacity-100 transition-opacity select-none">
			<input
				type="range"
				min={0}
				max={duration || 100}
				value={currentTime}
				onChange={(e) => onSeek(Number(e.target.value))}
				className="w-full h-1 accent-[#ff0000] cursor-pointer hover:h-1.5 transition-all"
				aria-label="Seek video"
			/>

			<div className="flex items-center justify-between text-white text-xs">
				<div className="flex items-center gap-4">
					<button
						type="button"
						onClick={onTogglePlay}
						className="p-1 hover:text-[#ff0000] cursor-pointer"
					>
						{isPlaying ? (
							<Pause className="w-5 h-5 fill-current" />
						) : (
							<Play className="w-5 h-5 fill-current" />
						)}
					</button>
					<button
						type="button"
						onClick={onToggleMute}
						className="p-1 hover:text-[#ff0000] cursor-pointer"
					>
						{isMuted ? (
							<VolumeX className="w-5 h-5" />
						) : (
							<Volume2 className="w-5 h-5" />
						)}
					</button>
					<span className="font-mono">
						{formatTime(currentTime)} / {formatTime(duration)}
					</span>
				</div>

				<div className="flex items-center gap-3">
					<div className="flex items-center bg-[rgba(255,255,255,0.1)] rounded-full overflow-hidden text-xs">
						<button
							type="button"
							onClick={() => reactionMutation.mutate("like")}
							className="px-3 py-1.5 hover:bg-[rgba(255,255,255,0.2)] flex items-center gap-1.5 cursor-pointer font-medium"
						>
							<ThumbsUp className="w-3.5 h-3.5" />
							<span>{likeCount}</span>
						</button>
						<div className="w-[1px] h-4 bg-[rgba(255,255,255,0.2)]" />
						<button
							type="button"
							onClick={() => reactionMutation.mutate("dislike")}
							className="px-3 py-1.5 hover:bg-[rgba(255,255,255,0.2)] flex items-center gap-1.5 cursor-pointer"
						>
							<ThumbsDown className="w-3.5 h-3.5" />
							{dislikeCount > 0 && <span>{dislikeCount}</span>}
						</button>
					</div>

					<button
						type="button"
						onClick={onToggleTheater}
						className="p-1.5 hover:text-[#ff0000] cursor-pointer"
						title="Theater mode (t)"
					>
						<Square className="w-4 h-4" />
					</button>
					<button
						type="button"
						onClick={onToggleFullscreen}
						className="p-1.5 hover:text-[#ff0000] cursor-pointer"
						title="Fullscreen (f)"
					>
						<Maximize className="w-4 h-4" />
					</button>
				</div>
			</div>
		</div>
	);
}
