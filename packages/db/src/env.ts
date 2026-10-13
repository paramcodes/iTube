import { z } from "zod";

const schema = z.object({
	DATABASE_URL: z.string().url().default("postgres://localhost:5432/itube_dev"),
});

export const env = schema.parse(process.env);
