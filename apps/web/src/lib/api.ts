import { treaty } from "@elysiajs/eden";
import type { App } from "../../../apps/api/src/index";
import { env } from "../env";

export const api = treaty<App>(env.NEXT_PUBLIC_API_URL);
