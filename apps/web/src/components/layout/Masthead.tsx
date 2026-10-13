"use client";

import { UserButton, useUser } from "@clerk/nextjs";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";
import { useSearchSuggestions } from "../../hooks/useSearchSuggestions";

export function Masthead({ onToggleDrawer }: { onToggleDrawer?: () => void }) {
	const [query, setQuery] = React.useState("");
	const [isFocused, setIsFocused] = React.useState(false);
	const router = useRouter();
	const { isSignedIn } = useUser();

	const { data: suggestions } = useSearchSuggestions(query);

	const handleSearch = (e: React.FormEvent) => {
		e.preventDefault();
		if (query.trim()) {
			setIsFocused(false);
			router.push(`/search?q=${encodeURIComponent(query.trim())}`);
		}
	};

	const handleSelectSuggestion = (suggestion: string) => {
		setQuery(suggestion);
		setIsFocused(false);
		router.push(`/search?q=${encodeURIComponent(suggestion)}`);
	};

	return (
		<header
			data-testid="masthead"
			className="fixed top-0 left-0 right-0 h-14 bg-[#0f0f0f] border-b border-[#212121] flex items-center justify-between px-4 z-50 select-none"
		>
			<div className="flex items-center gap-4">
				<button
					type="button"
					onClick={onToggleDrawer}
					className="p-2 rounded-full hover:bg-[#272727] text-[#f1f1f1] cursor-pointer"
					aria-label="Toggle menu"
				>
					<svg
						className="w-5 h-5 fill-current"
						viewBox="0 0 24 24"
						aria-hidden="true"
					>
						<path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
					</svg>
				</button>
				<Link
					href="/"
					className="flex items-center gap-1 font-bold text-lg text-white tracking-tighter"
				>
					<span className="text-[#ff0000] text-2xl leading-none">▶</span>
					<span>iTube</span>
				</Link>
			</div>

			<div className="relative flex-1 max-w-xl mx-4">
				<form onSubmit={handleSearch} className="flex items-center w-full">
					<div className="flex items-center w-full bg-[#121212] border border-[#303030] rounded-l-full px-4 py-1.5 focus-within:border-[#3ea6ff]">
						<input
							type="text"
							value={query}
							onChange={(e) => setQuery(e.target.value)}
							onFocus={() => setIsFocused(true)}
							onBlur={() => setTimeout(() => setIsFocused(false), 200)}
							placeholder="Search"
							className="w-full bg-transparent text-[#f1f1f1] placeholder-[#888] outline-none text-sm"
						/>
					</div>
					<button
						type="submit"
						className="bg-[#222] border border-l-0 border-[#303030] rounded-r-full px-6 py-2 hover:bg-[#272727] cursor-pointer"
						aria-label="Search"
					>
						<svg
							className="w-4 h-4 fill-[#f1f1f1]"
							viewBox="0 0 24 24"
							aria-hidden="true"
						>
							<path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
						</svg>
					</button>
				</form>

				{isFocused && suggestions && suggestions.length > 0 && (
					<div className="absolute top-full left-0 right-0 mt-1 bg-[#212121] border border-[#303030] rounded-xl shadow-2xl py-2 z-50">
						{suggestions.map((item) => (
							<button
								key={item}
								type="button"
								onMouseDown={() => handleSelectSuggestion(item)}
								className="w-full text-left px-4 py-1.5 text-sm text-[#f1f1f1] hover:bg-[#383838] flex items-center gap-3 cursor-pointer"
							>
								<span className="text-xs text-[#888]">🔍</span>
								<span className="truncate">{item}</span>
							</button>
						))}
					</div>
				)}
			</div>

			<div className="flex items-center gap-3">
				<Link
					href="/upload"
					className="text-xs px-3 py-1.5 rounded-full bg-[#272727] hover:bg-[#3d3d3d] text-white font-medium"
				>
					Upload
				</Link>
				<Link
					href="/studio"
					className="text-xs px-3 py-1.5 rounded-full bg-[#272727] hover:bg-[#3d3d3d] text-white font-medium"
				>
					Studio
				</Link>
				{isSignedIn ? (
					<UserButton />
				) : (
					<Link
						href="/sign-in"
						className="flex items-center gap-1.5 text-xs font-medium text-[#3ea6ff] border border-[#3ea6ff]/40 hover:bg-[#3ea6ff]/10 px-3 py-1.5 rounded-full"
					>
						Sign in
					</Link>
				)}
			</div>
		</header>
	);
}
