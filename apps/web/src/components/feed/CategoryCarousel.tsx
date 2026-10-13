"use client";

import * as React from "react";

export interface CategoryCarouselProps {
	categories: string[];
	active: string;
	onChange: (category: string) => void;
}

export function CategoryCarousel({
	categories,
	active,
	onChange,
}: CategoryCarouselProps) {
	return (
		<div className="flex items-center gap-3 overflow-x-auto py-3 no-scrollbar select-none sticky top-14 bg-[#0f0f0f] z-30">
			{categories.map((c) => {
				const isActive = c === active;
				return (
					<button
						key={c}
						type="button"
						onClick={() => onChange(c)}
						className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors cursor-pointer ${
							isActive
								? "bg-[#f1f1f1] text-[#0f0f0f]"
								: "bg-[#272727] text-[#f1f1f1] hover:bg-[#3d3d3d]"
						}`}
					>
						{c}
					</button>
				);
			})}
		</div>
	);
}
