import { Slot } from "@radix-ui/react-slot";
import { type VariantProps, cva } from "class-variance-authority";
import * as React from "react";
import { cn } from "../lib/utils";

const buttonVariants = cva(
	"inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer",
	{
		variants: {
			variant: {
				default:
					"bg-[rgba(255,255,255,0.1)] text-[#f1f1f1] hover:bg-[rgba(255,255,255,0.2)] active:bg-[rgba(255,255,255,0.25)]",
				primary:
					"bg-[#ff0000] text-white hover:bg-[#cc0000] active:bg-[#990000]",
				subscribe:
					"bg-white text-black hover:bg-[#d9d9d9] font-medium active:bg-[#bfbfbf]",
				subscribed:
					"bg-[rgba(255,255,255,0.1)] text-[#f1f1f1] hover:bg-[rgba(255,255,255,0.2)]",
				ghost:
					"bg-transparent text-[#f1f1f1] hover:bg-[rgba(255,255,255,0.1)] active:bg-[rgba(255,255,255,0.2)]",
				chip: "bg-[#272727] text-[#f1f1f1] hover:bg-[#3d3d3d] rounded-lg text-sm font-medium",
				chipActive:
					"bg-[#f1f1f1] text-[#0f0f0f] rounded-lg text-sm font-medium hover:bg-white",
				outline:
					"border border-[rgba(255,255,255,0.2)] bg-transparent text-[#3ea6ff] hover:bg-[rgba(62,166,255,0.1)]",
			},
			size: {
				default: "h-9 px-4 py-2",
				sm: "h-8 px-3 text-xs",
				lg: "h-10 px-6",
				icon: "h-10 w-10 p-0 rounded-full",
				chip: "h-8 px-3 py-1",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	},
);

export interface ButtonProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement>,
		VariantProps<typeof buttonVariants> {
	asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
	({ className, variant, size, asChild = false, ...props }, ref) => {
		const Comp = asChild ? Slot : "button";
		return (
			<Comp
				className={cn(buttonVariants({ variant, size, className }))}
				ref={ref}
				{...props}
			/>
		);
	},
);
Button.displayName = "Button";

export { buttonVariants };
