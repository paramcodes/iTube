import { createHmac, timingSafeEqual } from "node:crypto";
import Mux from "@mux/mux-node";
import { env } from "../env";

export const mux = new Mux({
	tokenId: env.MUX_TOKEN_ID,
	tokenSecret: env.MUX_TOKEN_SECRET,
});

export function verifyMuxSignature(
	header: string,
	rawBody: string,
	secret: string,
): boolean {
	const parts = Object.fromEntries(header.split(",").map((p) => p.split("=")));
	const ts = parts.t;
	const v1 = parts.v1;
	if (!ts || !v1) return false;
	const expected = createHmac("sha256", secret)
		.update(`${ts}.${rawBody}`)
		.digest("hex");
	try {
		return timingSafeEqual(
			Buffer.from(v1, "hex"),
			Buffer.from(expected, "hex"),
		);
	} catch {
		return false;
	}
}

export async function createDirectUpload() {
	return mux.video.uploads.create({
		new_asset_settings: {
			playback_policy: ["public"],
		},
		cors_origin: "*",
	});
}
