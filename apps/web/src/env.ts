import { z } from "zod";

const schema = z.object({
	NEXT_PUBLIC_API_URL: z.string().url().default("http://localhost:3001"),
	NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().default("pk_test_placeholder"),
});

export const env = schema.parse({
	NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
	NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:
		process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
});
