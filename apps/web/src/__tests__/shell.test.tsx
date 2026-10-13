import { describe, expect, it, mock } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";

// Mock next/navigation and clerk hooks
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
		const html = renderToStaticMarkup(
			<Shell>
				<div>content</div>
			</Shell>,
		);
		expect(html).toContain("masthead");
		expect(html).toContain("guide-drawer");
	});
});
