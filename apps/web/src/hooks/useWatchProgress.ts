"use client";

import { env } from "@/env";
import * as React from "react";

export function useWatchProgress(videoId: string) {
	const accumulatedSecondsRef = React.useRef(0);
	const lastSyncRef = React.useRef(0);

	React.useEffect(() => {
		const sessionId = Math.random().toString(36).substring(2);

		const interval = setInterval(() => {
			accumulatedSecondsRef.current += 10;

			// View qualification heartbeat
			fetch(`${env.NEXT_PUBLIC_API_URL}/api/videos/${videoId}/view`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					sessionId,
					sessionSeconds: accumulatedSecondsRef.current,
				}),
			}).catch(() => {});

			// Watch history throttle (30s)
			if (accumulatedSecondsRef.current - lastSyncRef.current >= 30) {
				lastSyncRef.current = accumulatedSecondsRef.current;
				fetch(`${env.NEXT_PUBLIC_API_URL}/api/videos/${videoId}/progress`, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						positionSeconds: accumulatedSecondsRef.current,
					}),
				}).catch(() => {});
			}
		}, 10000);

		const handleUnload = () => {
			const payload = JSON.stringify({
				positionSeconds: accumulatedSecondsRef.current,
			});
			navigator.sendBeacon?.(
				`${env.NEXT_PUBLIC_API_URL}/api/videos/${videoId}/progress`,
				new Blob([payload], { type: "application/json" }),
			);
		};

		window.addEventListener("beforeunload", handleUnload);
		window.addEventListener("pagehide", handleUnload);

		return () => {
			clearInterval(interval);
			window.removeEventListener("beforeunload", handleUnload);
			window.removeEventListener("pagehide", handleUnload);
		};
	}, [videoId]);
}
