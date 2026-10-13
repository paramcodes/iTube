import { describe, expect, it } from "bun:test";

type UploadState =
	| "idle"
	| "presigning"
	| "uploading"
	| "processing"
	| "done"
	| "error";

describe("upload state machine", () => {
	const transitions: Record<UploadState, UploadState[]> = {
		idle: ["presigning"],
		presigning: ["uploading", "error"],
		uploading: ["processing", "error"],
		processing: ["done", "error"],
		done: [],
		error: ["idle"],
	};
	it("idle transitions to presigning", () =>
		expect(transitions.idle).toContain("presigning"));
	it("done has no transitions", () => expect(transitions.done).toHaveLength(0));
});
