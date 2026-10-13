"use client";

import { Compass, History, Home, PlaySquare, ThumbsUp, Tv } from "lucide-react";
import Link from "next/link";
import * as React from "react";

export function GuideDrawer({ expanded = true }: { expanded?: boolean }) {
	const primaryNav = [
		{ label: "Home", href: "/", icon: Home },
		{ label: "Subscriptions", href: "/feed/subscriptions", icon: Tv },
	];

	const secondaryNav = [
		{ label: "History", href: "/feed/history", icon: History },
		{ label: "Your Videos", href: "/studio", icon: PlaySquare },
		{ label: "Liked Videos", href: "/playlist?list=LL", icon: ThumbsUp },
	];

	return (
		<aside
			data-testid="guide-drawer"
			className={`fixed top-14 left-0 bottom-0 bg-[#0f0f0f] transition-all duration-200 z-40 overflow-y-auto select-none ${
				expanded ? "w-60 px-3" : "w-[72px] px-1"
			}`}
		>
			<nav className="py-2 flex flex-col gap-1">
				{primaryNav.map((item) => {
					const Icon = item.icon;
					return (
						<Link
							key={item.label}
							href={item.href}
							className={`flex items-center rounded-xl text-sm font-medium hover:bg-[rgba(255,255,255,0.1)] text-[#f1f1f1] transition-colors ${
								expanded
									? "h-10 px-3 gap-6"
									: "flex-col justify-center py-3.5 gap-1 text-[10px] items-center text-center"
							}`}
						>
							<Icon
								className={expanded ? "w-5 h-5 shrink-0" : "w-5 h-5 mb-1"}
							/>
							<span className="truncate">{item.label}</span>
						</Link>
					);
				})}

				{expanded && (
					<>
						<div className="my-2 border-t border-[rgba(255,255,255,0.1)]" />
						<div className="px-3 py-1 text-sm font-semibold text-white">
							You
						</div>
						{secondaryNav.map((item) => {
							const Icon = item.icon;
							return (
								<Link
									key={item.label}
									href={item.href}
									className="flex items-center h-10 px-3 gap-6 rounded-xl text-sm font-medium hover:bg-[rgba(255,255,255,0.1)] text-[#f1f1f1] transition-colors"
								>
									<Icon className="w-5 h-5 shrink-0" />
									<span className="truncate">{item.label}</span>
								</Link>
							);
						})}
					</>
				)}
			</nav>
		</aside>
	);
}
