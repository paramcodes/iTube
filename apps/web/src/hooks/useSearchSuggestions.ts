import { env } from "@/env";
import { useQuery } from "@tanstack/react-query";
import * as React from "react";

export function useSearchSuggestions(query: string) {
	const [debouncedQuery, setDebouncedQuery] = React.useState(query);

	React.useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedQuery(query);
		}, 150);
		return () => clearTimeout(timer);
	}, [query]);

	return useQuery({
		queryKey: ["suggestions", debouncedQuery],
		queryFn: async () => {
			if (!debouncedQuery || debouncedQuery.trim().length < 2) {
				return [];
			}
			const res = await fetch(
				`${env.NEXT_PUBLIC_API_URL}/api/search/suggestions?q=${encodeURIComponent(
					debouncedQuery.trim(),
				)}`,
			);
			if (!res.ok) return [];
			const data = await res.json();
			return (data.suggestions as string[]) || [];
		},
		enabled: debouncedQuery.trim().length >= 2,
		staleTime: 60000,
	});
}
