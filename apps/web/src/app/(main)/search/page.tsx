"use client";

import { useSearchParams } from "next/navigation";
import * as React from "react";
import { SearchResults } from "../../../components/search/SearchResults";

export default function SearchPage() {
	const searchParams = useSearchParams();
	const q = searchParams.get("q") || "";

	return (
		<div className="min-h-screen py-2">
			<h1 className="text-sm text-[#888] mb-4">
				Search results for{" "}
				<span className="text-white font-semibold">"{q}"</span>
			</h1>
			<SearchResults query={q} />
		</div>
	);
}
