import { describe, expect, it } from "bun:test";
import { createHmac } from "node:crypto";
import { verifyMuxSignature } from "../services/MuxService";

describe("Mux webhook signature", () => {
	it("accepts valid signature", () => {
		const secret = "test_secret";
		const ts = String(Math.floor(Date.now() / 1000));
		const body = JSON.stringify({ type: "video.asset.ready" });
		const sig = createHmac("sha256", secret)
			.update(`${ts}.${body}`)
			.digest("hex");
		const header = `t=${ts},v1=${sig}`;
		expect(verifyMuxSignature(header, body, secret)).toBe(true);
	});

	it("rejects tampered body", () => {
		const secret = "test_secret";
		const ts = String(Math.floor(Date.now() / 1000));
		const sig = createHmac("sha256", secret)
			.update(`${ts}.original`)
			.digest("hex");
		expect(verifyMuxSignature(`t=${ts},v1=${sig}`, "tampered", secret)).toBe(
			false,
		);
	});
});
