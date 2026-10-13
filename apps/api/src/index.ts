import { cors } from "@elysiajs/cors";
import { Elysia } from "elysia";
import { channelRoutes } from "./routes/channels";
import { commentRoutes } from "./routes/comments";
import { feedRoutes } from "./routes/feed";
import { reactionRoutes } from "./routes/reactions";
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
	.use(videoRoutes)
	.use(feedRoutes)
	.use(searchRoutes)
	.use(commentRoutes)
	.use(reactionRoutes)
	.use(studioRoutes);

export type App = typeof app;
