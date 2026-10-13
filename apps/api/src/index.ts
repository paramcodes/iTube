import { cors } from "@elysiajs/cors";
import { Elysia } from "elysia";
import { startDailyStatsRollup } from "./jobs/dailyStatsRollup";
import { startSchedulingFallback } from "./jobs/schedulingFallback";
import { startViewFlushJob } from "./jobs/viewFlush";
import { channelRoutes } from "./routes/channels";
import { commentRoutes } from "./routes/comments";
import { feedRoutes } from "./routes/feed";
import { reactionRoutes } from "./routes/reactions";
import { schedulingRoutes } from "./routes/scheduling";
import { searchRoutes } from "./routes/search";
import { studioRoutes } from "./routes/studio";
import { uploadRoutes } from "./routes/upload";
import { videoRoutes } from "./routes/videos";
import { webhookRoutes } from "./routes/webhooks";

export const app = new Elysia()
	.use(cors())
	.use(channelRoutes)
	.use(uploadRoutes)
	.use(webhookRoutes)
	.use(schedulingRoutes)
	.use(videoRoutes)
	.use(feedRoutes)
	.use(searchRoutes)
	.use(commentRoutes)
	.use(reactionRoutes)
	.use(studioRoutes);

// Background jobs only run in live server mode (not during test imports)
if (process.env.NODE_ENV !== "test") {
	startViewFlushJob();
	startSchedulingFallback();
	startDailyStatsRollup();
}

export type App = typeof app;
