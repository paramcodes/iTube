import { type VariantProps, cva } from "class-variance-authority";
import type * as React from "react";
import { cn } from "../lib/utils";

const badgeVariants = cva(
	"inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium uppercase select-none",
	{
		variants: {
			variant: {
				public: "bg-emerald-950 text-emerald-400 border border-emerald-800",
				unlisted: "bg-amber-950 text-amber-400 border border-amber-800",
				private: "bg-neutral-800 text-neutral-400 border border-neutral-700",
				scheduled: "bg-blue-950 text-blue-400 border border-blue-800",
				live: "bg-[#ff0000] text-white font-bold tracking-wider",
				duration:
					"bg-[rgba(0,0,0,0.8)] text-white text-[11px] font-medium px-1.5 py-0.5 rounded normal-case",
			},
		},
		defaultVariants: {
			variant: "public",
		},
	},
);

export interface BadgeProps
	extends React.HTMLAttributes<HTMLDivElement>,
		VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
	return (
		<div className={cn(badgeVariants({ variant, className }))} {...props} />
	);
}
