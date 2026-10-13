"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { QueryClientProvider } from "@tanstack/react-query";
import type * as React from "react";
import { queryClient } from "../lib/query-client";

export function Providers({ children }: { children: React.ReactNode }) {
	return (
		<ClerkProvider>
			<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
		</ClerkProvider>
	);
}
