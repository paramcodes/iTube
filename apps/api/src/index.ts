import { cors } from "@elysiajs/cors";
import { Elysia } from "elysia";
import { requireChannelOwner } from "./lib/auth";
import { channelRoutes } from "./routes/channels";
import { feedRoutes } from "./routes/feed";
import { searchRoutes } from "./routes/search";
import { uploadRoutes } from "./routes/upload";
import { videoRoutes } from "./routes/videos";
import { webhookRoutes } from "./routes/webhooks";

const studioStub = new Elysia({ prefix: "/api/studio" })
	.use(requireChannelOwner)
	.get("/videos", () => ({ items: [], nextCursor: null }));

export const app = new Elysia()
	.use(cors())
	.use(channelRoutes)
	.use(uploadRoutes)
	.use(webhookRoutes)
	.use(videoRoutes)
	.use(feedRoutes)
	.use(searchRoutes)
	.use(studioStub);

export type App = typeof app;
