import { StudioVideoUpdate } from "@itube/types";
import { Elysia, t } from "elysia";
import { requireChannelOwner } from "../lib/auth";
import {
	getChannelAnalytics,
	getStudioVideo,
	listStudioVideos,
	removeStudioVideo,
	updateStudioVideo,
} from "../services/StudioVideoService";

export const studioRoutes = new Elysia({ prefix: "/api/studio" })
	.use(requireChannelOwner)
	.get(
		"/videos",
		async ({ channel, query: { cursor, limit, visibility } }) => {
			return await listStudioVideos(channel.id, {
				cursor,
				limit: limit ? Number(limit) : undefined,
				visibility,
			});
		},
		{
			query: t.Object({
				cursor: t.Optional(t.String()),
				limit: t.Optional(t.String()),
				visibility: t.Optional(t.String()),
			}),
		},
	)
	.get(
		"/videos/:id",
		async ({ channel, params: { id }, set }) => {
			const video = await getStudioVideo(channel.id, id);
			if (!video) {
				set.status = 404;
				return { error: "Video not found" };
			}
			return video;
		},
		{
			params: t.Object({
				id: t.String(),
			}),
		},
	)
	.patch(
		"/videos/:id",
		async ({ channel, params: { id }, body, set }) => {
			const parsed = StudioVideoUpdate.safeParse(body);
			if (!parsed.success) {
				set.status = 400;
				return { error: "Invalid update payload", issues: parsed.error.issues };
			}
			const updated = await updateStudioVideo(channel.id, id, parsed.data);
			if (!updated) {
				set.status = 404;
				return { error: "Video not found" };
			}
			return updated;
		},
		{
			params: t.Object({
				id: t.String(),
			}),
		},
	)
	.delete(
		"/videos/:id",
		async ({ channel, params: { id }, set }) => {
			const success = await removeStudioVideo(channel.id, id);
			if (!success) {
				set.status = 404;
				return { error: "Video not found" };
			}
			set.status = 204;
			return null;
		},
		{
			params: t.Object({
				id: t.String(),
			}),
		},
	)
	.get(
		"/analytics",
		async ({ channel, query: { days } }) => {
			const d = days === "7" ? 7 : 28;
			return await getChannelAnalytics(channel.id, d);
		},
		{
			query: t.Object({
				days: t.Optional(t.String()),
			}),
		},
	);
