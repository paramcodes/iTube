"use client";

import Link from "next/link";
import * as React from "react";

export function GuideDrawer({ expanded = true }: { expanded?: boolean }) {
	const items = [
		{ label: "Home", href: "/", icon: "🏠" },
		{ label: "Subscriptions", href: "/feed/subscriptions", icon: "📺" },
		{ label: "History", href: "/feed/history", icon: "⏳" },
		{ label: "Watch Later", href: "/playlist?list=WL", icon: "⏱️" },
	];

	return (
		<aside
			data-testid="guide-drawer"
			className={`fixed top-14 left-0 bottom-0 bg-[#0f0f0f] border-r border-[#212121] transition-all duration-200 z-40 overflow-y-auto ${
				expanded ? "w-60" : "w-18"
			}`}
		>
			<nav className="p-2 space-y-1">
				{items.map((item) => (
					<Link
						key={item.label}
						href={item.href}
						className={`flex items-center gap-4 px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-[#272727] text-[#f1f1f1] ${
							!expanded
								? "flex-col justify-center gap-1 text-[10px] px-1 py-3 text-center"
								: ""
						}`}
					>
						<span className="text-lg">{item.icon}</span>
						<span className="truncate">{item.label}</span>
					</Link>
				))}
			</nav>
		</aside>
	);
}
