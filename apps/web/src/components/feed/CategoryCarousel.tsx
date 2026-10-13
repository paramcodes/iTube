"use client";

import { Button } from "@itube/ui";
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
					<Button
						key={c}
						type="button"
						variant={isActive ? "chipActive" : "chip"}
						size="chip"
						onClick={() => onChange(c)}
						className="whitespace-nowrap transition-colors"
					>
						{c}
					</Button>
				);
			})}
		</div>
	);
}
