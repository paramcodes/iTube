import { z } from "zod";

const schema = z.object({
	DATABASE_URL: z.string().default("postgres://localhost:5432/itube_dev"),
	CLERK_SECRET_KEY: z.string().default("sk_test_placeholder"),
	CLERK_PUBLISHABLE_KEY: z.string().default("pk_test_placeholder"),
	CLERK_WEBHOOK_SECRET: z.string().default("whsec_placeholder"),
	MUX_TOKEN_ID: z.string().default("mux_token_id_placeholder"),
	MUX_TOKEN_SECRET: z.string().default("mux_token_secret_placeholder"),
	MUX_WEBHOOK_SECRET: z.string().default("mux_webhook_secret_placeholder"),
	UPSTASH_REDIS_REST_URL: z
		.string()
		.url()
		.default("https://placeholder.upstash.io"),
	UPSTASH_REDIS_REST_TOKEN: z.string().default("upstash_token_placeholder"),
	QSTASH_TOKEN: z.string().default("qstash_token_placeholder"),
	API_BASE_URL: z.string().default("http://localhost:3001"),
});

export const env = schema.parse(process.env);
