import { cors } from "@elysiajs/cors";
import { Elysia } from "elysia";
import { startDailyStatsRollup } from "./jobs/dailyStatsRollup";
import { startSchedulingFallback } from "./jobs/schedulingFallback";
import { startViewFlushJob } from "./jobs/viewFlush";
import { channelRoutes } from "./routes/channels";
import { clerkWebhookRoutes } from "./routes/clerk-webhook";
import { commentRoutes } from "./routes/comments";
import { feedRoutes } from "./routes/feed";
import { reactionRoutes } from "./routes/reactions";
import { schedulingRoutes } from "./routes/scheduling";
import { searchRoutes } from "./routes/search";
import { studioRoutes } from "./routes/studio";
import { subscriptionRoutes } from "./routes/subscriptions";
import { uploadRoutes } from "./routes/upload";
import { videoRoutes } from "./routes/videos";
import { webhookRoutes } from "./routes/webhooks";

export const app = new Elysia()
	.use(cors())
	.use(channelRoutes)
	.use(subscriptionRoutes)
	.use(uploadRoutes)
	.use(webhookRoutes)
	.use(clerkWebhookRoutes)
	.use(schedulingRoutes)
	.use(videoRoutes)
	.use(feedRoutes)
	.use(searchRoutes)
	.use(commentRoutes)
	.use(reactionRoutes)
	.use(studioRoutes);

if (process.env.NODE_ENV !== "test") {
	startViewFlushJob();
	startSchedulingFallback();
	startDailyStatsRollup();
}

export type App = typeof app;
