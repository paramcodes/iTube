"use client";

import * as React from "react";
import { PlayerControls } from "./PlayerControls";

export interface VideoPlayerProps {
	playbackId?: string | null;
	videoId: string;
	title: string;
	likeCount: number;
	dislikeCount: number;
}

export function VideoPlayer({
	playbackId,
	videoId,
	title: _title,
	likeCount,
	dislikeCount,
}: VideoPlayerProps) {
	const containerRef = React.useRef<HTMLDivElement>(null);
	const videoRef = React.useRef<HTMLVideoElement>(null);

	const [isPlaying, setIsPlaying] = React.useState(false);
	const [currentTime, setCurrentTime] = React.useState(0);
	const [duration, setDuration] = React.useState(0);
	const [isMuted, setIsMuted] = React.useState(false);
	const [isTheater, setIsTheater] = React.useState(false);

	const togglePlay = React.useCallback(() => {
		if (!videoRef.current) return;
		if (videoRef.current.paused) {
			videoRef.current.play();
			setIsPlaying(true);
		} else {
			videoRef.current.pause();
			setIsPlaying(false);
		}
	}, []);

	const toggleMute = React.useCallback(() => {
		if (!videoRef.current) return;
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
		if (!videoRef.current) return;
		videoRef.current.currentTime = time;
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

	return (
		<div
			ref={containerRef}
			className={`relative bg-black rounded-xl overflow-hidden group select-none ${
				isTheater ? "w-full aspect-video max-h-[80vh]" : "w-full aspect-video"
			}`}
		>
			{playbackId ? (
				<video
					ref={videoRef}
					src={`https://stream.mux.com/${playbackId}.m3u8`}
					className="w-full h-full object-contain cursor-pointer"
					onClick={togglePlay}
					onKeyDown={(e) => {
						if (e.key === " " || e.key === "Enter") togglePlay();
					}}
					onTimeUpdate={() => {
						if (videoRef.current) {
							setCurrentTime(videoRef.current.currentTime);
							setDuration(videoRef.current.duration || 0);
						}
					}}
					playsInline
				>
					<track kind="captions" />
				</video>
			) : (
				<div className="w-full h-full flex items-center justify-center text-sm text-[#888]">
					Video stream processing or unavailable
				</div>
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
