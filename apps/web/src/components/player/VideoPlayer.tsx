"use client";

import * as React from "react";
import { PlayerControls } from "./PlayerControls";

export interface VideoPlayerProps {
	playbackId?: string | null;
	posterUrl?: string | null;
	videoId: string;
	title: string;
	likeCount: number;
	dislikeCount: number;
}

export function VideoPlayer({
	playbackId,
	posterUrl,
	videoId,
	title: _title,
	likeCount,
	dislikeCount,
}: VideoPlayerProps) {
	const containerRef = React.useRef<HTMLDivElement>(null);
	const videoRef = React.useRef<HTMLVideoElement>(null);

	const [isPlaying, setIsPlaying] = React.useState(false);
	const [currentTime, setCurrentTime] = React.useState(0);
	const [duration, setDuration] = React.useState(765);
	const [isMuted, setIsMuted] = React.useState(false);
	const [isTheater, setIsTheater] = React.useState(false);

	const togglePlay = React.useCallback(() => {
		if (!videoRef.current) {
			setIsPlaying((prev) => !prev);
			return;
		}
		if (videoRef.current.paused) {
			videoRef.current.play().catch(() => {});
			setIsPlaying(true);
		} else {
			videoRef.current.pause();
			setIsPlaying(false);
		}
	}, []);

	const toggleMute = React.useCallback(() => {
		if (!videoRef.current) {
			setIsMuted((prev) => !prev);
			return;
		}
		videoRef.current.muted = !videoRef.current.muted;
		setIsMuted(videoRef.current.muted);
	}, []);

	const toggleFullscreen = React.useCallback(() => {
		if (!containerRef.current) return;
		if (document.fullscreenElement) {
			document.exitFullscreen();
		} else {
			containerRef.current.requestFullscreen();
		}
	}, []);

	const handleSeek = (time: number) => {
		if (videoRef.current) {
			videoRef.current.currentTime = time;
		}
		setCurrentTime(time);
	};

	React.useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (["INPUT", "TEXTAREA"].includes((e.target as HTMLElement).tagName))
				return;
			if (e.key === " " || e.key === "k") {
				e.preventDefault();
				togglePlay();
			} else if (e.key === "m") {
				toggleMute();
			} else if (e.key === "f") {
				toggleFullscreen();
			} else if (e.key === "t") {
				setIsTheater((prev) => !prev);
			}
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [togglePlay, toggleMute, toggleFullscreen]);

	// Realistic public MP4 fallback for preview when Mux live stream ID is demo
	const videoSource = playbackId?.startsWith("http")
		? playbackId
		: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

	return (
		<div
			ref={containerRef}
			className={`relative bg-black rounded-2xl overflow-hidden group select-none shadow-2xl border border-[rgba(255,255,255,0.08)] ${
				isTheater ? "w-full aspect-video max-h-[80vh]" : "w-full aspect-video"
			}`}
		>
			<video
				ref={videoRef}
				src={videoSource}
				poster={
					posterUrl ||
					"https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1280&auto=format&fit=crop&q=80"
				}
				className="w-full h-full object-contain cursor-pointer"
				onClick={togglePlay}
				onKeyDown={(e) => {
					if (e.key === " " || e.key === "Enter") togglePlay();
				}}
				onTimeUpdate={() => {
					if (videoRef.current) {
						setCurrentTime(videoRef.current.currentTime);
						setDuration(videoRef.current.duration || 765);
					}
				}}
				playsInline
			>
				<track kind="captions" />
			</video>

			{/* Center play icon overlay when paused */}
			{!isPlaying && (
				<button
					type="button"
					onClick={togglePlay}
					className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors cursor-pointer"
				>
					<div className="w-16 h-16 rounded-full bg-[rgba(0,0,0,0.7)] flex items-center justify-center text-white pl-1 shadow-lg border border-white/20 hover:scale-110 transition-transform">
						<svg
							className="w-8 h-8 fill-current"
							viewBox="0 0 24 24"
							aria-hidden="true"
						>
							<path d="M8 5v14l11-7z" />
						</svg>
					</div>
				</button>
			)}

			<PlayerControls
				videoId={videoId}
				isPlaying={isPlaying}
				onTogglePlay={togglePlay}
				currentTime={currentTime}
				duration={duration}
				onSeek={handleSeek}
				isMuted={isMuted}
				onToggleMute={toggleMute}
				isTheater={isTheater}
				onToggleTheater={() => setIsTheater((prev) => !prev)}
				onToggleFullscreen={toggleFullscreen}
				likeCount={likeCount}
				dislikeCount={dislikeCount}
			/>
		</div>
	);
}
