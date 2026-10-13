const buses = new Map<string, BroadcastChannel>();
const counts = new Map<string, number>();

export function acquireCommentBus(videoId: string): BroadcastChannel {
	let bus = buses.get(videoId);
	if (!bus) {
		bus = new BroadcastChannel(`comments:${videoId}`);
		buses.set(videoId, bus);
	}
	counts.set(videoId, (counts.get(videoId) ?? 0) + 1);
	return bus;
}

export function releaseCommentBus(videoId: string): void {
	const n = (counts.get(videoId) ?? 1) - 1;
	counts.set(videoId, n);
	if (n <= 0) {
		buses.get(videoId)?.close();
		buses.delete(videoId);
		counts.delete(videoId);
	}
}

export function publishComment(videoId: string, event: unknown): void {
	buses.get(videoId)?.postMessage(event);
}
