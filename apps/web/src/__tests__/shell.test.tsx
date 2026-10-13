import { describe, expect, it, mock } from "bun:test";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderToStaticMarkup } from "react-dom/server";

mock.module("next/navigation", () => ({
	useRouter: () => ({ push: () => {} }),
}));

mock.module("@clerk/nextjs", () => ({
	UserButton: () => <div data-testid="user-button" />,
	useUser: () => ({ isSignedIn: false }),
}));

import Shell from "../components/layout/Shell";

describe("Shell", () => {
	it("renders masthead and drawer", () => {
		const queryClient = new QueryClient();
		const html = renderToStaticMarkup(
			<QueryClientProvider client={queryClient}>
				<Shell>
					<div>content</div>
				</Shell>
			</QueryClientProvider>,
		);
		expect(html).toContain("masthead");
		expect(html).toContain("guide-drawer");
	});
});
