"use client";

import { UserButton, useUser } from "@clerk/nextjs";
import { Button, Input } from "@itube/ui";
import { Bell, Menu, Mic, Search, Video } from "lucide-react";
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
				<Button
					variant="ghost"
					size="icon"
					onClick={onToggleDrawer}
					aria-label="Toggle menu"
				>
					<Menu className="w-5 h-5" />
				</Button>
				<Link
					href="/"
					className="flex items-center gap-1 font-bold text-lg text-white tracking-tighter"
				>
					<span className="text-[#ff0000] text-2xl leading-none">▶</span>
					<span>iTube</span>
				</Link>
			</div>

			<div className="relative flex-1 max-w-xl mx-4 flex items-center gap-3">
				<form onSubmit={handleSearch} className="flex items-center w-full">
					<div className="flex items-center w-full bg-[#121212] border border-[rgba(255,255,255,0.2)] rounded-l-full px-4 h-10 focus-within:border-[#3ea6ff] focus-within:ml-0">
						<Search className="w-4 h-4 text-[#888] mr-2 shrink-0" />
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
					<Button
						type="submit"
						variant="default"
						aria-label="Search"
						className="rounded-l-none rounded-r-full h-10 px-6 border border-l-0 border-[rgba(255,255,255,0.2)] bg-[rgba(255,255,255,0.08)] hover:bg-[rgba(255,255,255,0.15)]"
					>
						<Search className="w-4 h-4 text-[#f1f1f1]" />
					</Button>
				</form>

				<Button
					type="button"
					variant="default"
					size="icon"
					className="bg-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.2)] shrink-0"
					title="Search with your voice"
				>
					<Mic className="w-4 h-4 text-[#f1f1f1]" />
				</Button>

				{isFocused && suggestions && suggestions.length > 0 && (
					<div className="absolute top-full left-0 right-14 mt-1 bg-[#212121] border border-[rgba(255,255,255,0.1)] rounded-xl shadow-2xl py-2 z-50">
						{suggestions.map((item) => (
							<button
								key={item}
								type="button"
								onMouseDown={() => handleSelectSuggestion(item)}
								className="w-full text-left px-4 py-2 text-sm text-[#f1f1f1] hover:bg-[rgba(255,255,255,0.1)] flex items-center gap-3 cursor-pointer"
							>
								<Search className="w-4 h-4 text-[#888]" />
								<span className="truncate">{item}</span>
							</button>
						))}
					</div>
				)}
			</div>

			<div className="flex items-center gap-2">
				<Link href="/upload">
					<Button variant="ghost" size="icon" title="Create / Upload Video">
						<Video className="w-5 h-5 text-[#f1f1f1]" />
					</Button>
				</Link>
				<Link href="/studio">
					<Button
						variant="ghost"
						size="sm"
						className="text-xs font-semibold px-3"
					>
						Studio
					</Button>
				</Link>
				<Button variant="ghost" size="icon" title="Notifications">
					<Bell className="w-5 h-5 text-[#f1f1f1]" />
				</Button>
				{isSignedIn ? (
					<UserButton />
				) : (
					<Link href="/sign-in">
						<Button
							variant="outline"
							size="sm"
							className="gap-1.5 font-medium rounded-full"
						>
							Sign in
						</Button>
					</Link>
				)}
			</div>
		</header>
	);
}
