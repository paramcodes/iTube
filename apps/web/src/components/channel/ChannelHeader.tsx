"use client";

import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import * as React from "react";
import { useSubscription } from "../../hooks/useSubscription";

export interface ChannelHeaderProps {
	channel: {
		id: string;
		name: string;
		handle: string;
		avatarUrl?: string | null;
		bannerUrl?: string | null;
		description?: string | null;
		subscriberCount: number;
	};
}

export function ChannelHeader({ channel }: ChannelHeaderProps) {
	const { isSignedIn } = useUser();
	const { isSubscribed, toggleSubscription, isToggling } = useSubscription(
		channel.handle,
	);

	return (
		<div className="flex flex-col gap-6">
			<div className="w-full h-40 sm:h-52 md:h-64 bg-[#212121] rounded-2xl overflow-hidden">
				{channel.bannerUrl ? (
					<img
						src={channel.bannerUrl}
						alt={`${channel.name} banner`}
						className="w-full h-full object-cover"
					/>
				) : (
					<div className="w-full h-full flex items-center justify-center text-sm text-[#666]">
						No banner uploaded
					</div>
				)}
			</div>

			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-2">
				<div className="flex items-center gap-5">
					<div className="w-20 h-20 sm:w-28 sm:h-28 rounded-full bg-[#3d3d3d] overflow-hidden shrink-0 flex items-center justify-center font-bold text-2xl text-white">
						{channel.avatarUrl ? (
							<img
								src={channel.avatarUrl}
								alt={channel.name}
								className="w-full h-full object-cover"
							/>
						) : (
							channel.name.charAt(0)
						)}
					</div>

					<div className="flex flex-col">
						<h1 className="text-2xl font-bold text-white">{channel.name}</h1>
						<span className="text-sm text-[#aaa]">@{channel.handle}</span>
						<span className="text-xs text-[#888] mt-1">
							{channel.subscriberCount.toLocaleString()} subscribers
						</span>
						{channel.description && (
							<p className="text-xs text-[#aaa] mt-2 line-clamp-2 max-w-xl">
								{channel.description}
							</p>
						)}
					</div>
				</div>

				<div>
					{isSignedIn ? (
						<button
							type="button"
							onClick={() => toggleSubscription()}
							disabled={isToggling}
							className={`px-5 py-2.5 rounded-full text-sm font-semibold cursor-pointer transition-colors ${
								isSubscribed
									? "bg-[#272727] text-white hover:bg-[#383838]"
									: "bg-white text-black hover:bg-[#e5e5e5]"
							}`}
						>
							{isSubscribed ? "Subscribed" : "Subscribe"}
						</button>
					) : (
						<Link
							href="/sign-in"
							className="px-5 py-2.5 rounded-full text-sm font-semibold bg-white text-black hover:bg-[#e5e5e5] inline-block"
						>
							Subscribe
						</Link>
					)}
				</div>
			</div>
		</div>
	);
}
