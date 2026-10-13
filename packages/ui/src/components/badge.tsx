import { type VariantProps, cva } from "class-variance-authority";
import type * as React from "react";

const badgeVariants = cva(
	"inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium uppercase select-none",
	{
		variants: {
			variant: {
				public: "bg-emerald-950 text-emerald-400 border border-emerald-800",
				unlisted: "bg-amber-950 text-amber-400 border border-amber-800",
				private: "bg-neutral-800 text-neutral-400 border border-neutral-700",
				scheduled: "bg-blue-950 text-blue-400 border border-blue-800",
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
	return <div className={badgeVariants({ variant, className })} {...props} />;
}
