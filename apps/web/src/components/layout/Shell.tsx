"use client";

import * as React from "react";
import { GuideDrawer } from "./GuideDrawer";
import { Masthead } from "./Masthead";

export default function Shell({ children }: { children: React.ReactNode }) {
	const [expanded, setExpanded] = React.useState(true);

	return (
		<div className="min-h-screen bg-[#0f0f0f] text-[#f1f1f1]">
			<Masthead onToggleDrawer={() => setExpanded((prev) => !prev)} />
			<GuideDrawer expanded={expanded} />
			<main
				className={`pt-14 transition-all duration-200 min-h-screen ${
					expanded ? "pl-60" : "pl-18"
				}`}
			>
				<div className="p-4">{children}</div>
			</main>
		</div>
	);
}
