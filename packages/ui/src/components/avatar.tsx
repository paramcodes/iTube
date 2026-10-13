import * as React from "react";

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
	src?: string | null;
	alt?: string;
	fallback?: string;
}

export const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
	({ className = "", src, alt = "", fallback = "U", ...props }, ref) => {
		const [imageError, setImageError] = React.useState(false);

		return (
			<div
				ref={ref}
				className={`relative inline-flex h-9 w-9 shrink-0 overflow-hidden rounded-full bg-[#272727] items-center justify-center font-medium text-xs text-[#f1f1f1] select-none ${className}`}
				{...props}
			>
				{src && !imageError ? (
					<img
						src={src}
						alt={alt}
						onError={() => setImageError(true)}
						className="aspect-square h-full w-full object-cover"
					/>
				) : (
					<span>{fallback}</span>
				)}
			</div>
		);
	},
);
Avatar.displayName = "Avatar";
