import { z } from "zod";

export const CursorSchema = z.object({
	createdAt: z.string(),
	id: z.string(),
});

export type Cursor = z.infer<typeof CursorSchema>;

export function encodeCursor(obj: {
	createdAt: Date | string;
	id: string;
}): string {
	const createdAt =
		obj.createdAt instanceof Date ? obj.createdAt.toISOString() : obj.createdAt;
	const payload = JSON.stringify({ createdAt, id: obj.id });
	return Buffer.from(payload).toString("base64");
}

export function decodeCursor(s: string): { createdAt: string; id: string } {
	const json = Buffer.from(s, "base64").toString("utf-8");
	return CursorSchema.parse(JSON.parse(json));
}
