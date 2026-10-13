import { type VariantProps, cva } from "class-variance-authority";
import * as React from "react";

const buttonVariants = cva(
	"inline-flex items-center justify-center rounded-full text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer",
	{
		variants: {
			variant: {
				default: "bg-[#212121] text-[#f1f1f1] hover:bg-[#3d3d3d]",
				primary: "bg-[#ff0000] text-white hover:bg-[#cc0000]",
				ghost: "bg-transparent text-[#f1f1f1] hover:bg-[#272727]",
				secondary: "bg-[#272727] text-[#f1f1f1] hover:bg-[#3f3f3f]",
			},
			size: {
				default: "h-9 px-4 py-2",
				sm: "h-8 px-3 text-xs",
				lg: "h-10 px-6",
				icon: "h-9 w-9 p-0",
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
	({ className, variant, size, ...props }, ref) => {
		return (
			<button
				className={buttonVariants({ variant, size, className })}
				ref={ref}
				{...props}
			/>
		);
	},
);
Button.displayName = "Button";
