import * as React from "react";
import { cn } from "../lib/utils";

export interface InputProps
	extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
	({ className, type, ...props }, ref) => {
		return (
			<input
				type={type}
				className={cn(
					"flex h-10 w-full rounded-xl border border-[rgba(255,255,255,0.2)] bg-[#121212] px-4 py-2 text-sm text-[#f1f1f1] placeholder:text-[#888] focus:border-[#3ea6ff] focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 transition-colors",
					className,
				)}
				ref={ref}
				{...props}
			/>
		);
	},
);
Input.displayName = "Input";
