import { env } from "@/env";
import { useAuthFetch } from "@/lib/authFetch";
import { useQuery } from "@tanstack/react-query";
import * as React from "react";

export function AnalyticsDashboard() {
	const [days, setDays] = React.useState<7 | 28>(28);
	const authFetch = useAuthFetch();

	const { data, isLoading } = useQuery({
		queryKey: ["studio-analytics", days],
		queryFn: async () => {
			const res = await authFetch(
				`${env.NEXT_PUBLIC_API_URL}/api/studio/analytics?days=${days}`,
			);
			if (!res.ok) return null;
			return (await res.json()) as {
				days: number;
				views: number;
				watchTimeSeconds: number;
				subscribersGained: number;
			};
		},
	});

	return (
		<div className="bg-[#1e1e1e] border border-[#303030] rounded-2xl p-6 mb-8">
			<div className="flex items-center justify-between mb-6">
				<div>
					<h2 className="text-lg font-bold text-white">Channel Analytics</h2>
					<p className="text-xs text-[#888]">Summary metrics</p>
				</div>

				<div className="flex bg-[#121212] p-1 rounded-xl border border-[#303030] text-xs">
					<button
						type="button"
						onClick={() => setDays(7)}
						className={`px-3 py-1 rounded-lg font-medium cursor-pointer ${
							days === 7
								? "bg-[#272727] text-white"
								: "text-[#888] hover:text-white"
						}`}
					>
						7 Days
					</button>
					<button
						type="button"
						onClick={() => setDays(28)}
						className={`px-3 py-1 rounded-lg font-medium cursor-pointer ${
							days === 28
								? "bg-[#272727] text-white"
								: "text-[#888] hover:text-white"
						}`}
					>
						28 Days
					</button>
				</div>
			</div>

			{isLoading ? (
				<div className="grid grid-cols-3 gap-4 animate-pulse">
					<div className="h-20 bg-[#272727] rounded-xl" />
					<div className="h-20 bg-[#272727] rounded-xl" />
					<div className="h-20 bg-[#272727] rounded-xl" />
				</div>
			) : (
				<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
					<div className="bg-[#121212] border border-[#2b2b2b] rounded-xl p-4">
						<span className="text-xs font-semibold text-[#888] uppercase">
							Views
						</span>
						<div className="text-2xl font-bold text-white mt-1">
							{(data?.views || 0).toLocaleString()}
						</div>
					</div>
					<div className="bg-[#121212] border border-[#2b2b2b] rounded-xl p-4">
						<span className="text-xs font-semibold text-[#888] uppercase">
							Watch Time
						</span>
						<div className="text-2xl font-bold text-white mt-1">
							{Math.round((data?.watchTimeSeconds || 0) / 3600)} hrs
						</div>
					</div>
					<div className="bg-[#121212] border border-[#2b2b2b] rounded-xl p-4">
						<span className="text-xs font-semibold text-[#888] uppercase">
							Subscribers Gained
						</span>
						<div className="text-2xl font-bold text-white mt-1">
							{(data?.subscribersGained || 0).toLocaleString()}
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
