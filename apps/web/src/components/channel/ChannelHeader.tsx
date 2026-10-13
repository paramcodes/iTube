"use client";

import { useUser } from "@clerk/nextjs";
import { Avatar, AvatarFallback, AvatarImage, Button } from "@itube/ui";
import { Bell, Check } from "lucide-react";
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
			<div className="w-full h-40 sm:h-52 md:h-64 bg-[#212121] rounded-2xl overflow-hidden border border-[rgba(255,255,255,0.08)]">
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
				<div className="flex items-center gap-6">
					<Avatar className="w-20 h-20 sm:w-28 sm:h-28 text-2xl font-bold">
						<AvatarImage src={channel.avatarUrl} alt={channel.name} />
						<AvatarFallback>{channel.name.charAt(0)}</AvatarFallback>
					</Avatar>

					<div className="flex flex-col">
						<h1 className="text-2xl font-bold text-white tracking-tight">
							{channel.name}
						</h1>
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
						<Button
							variant={isSubscribed ? "subscribed" : "subscribe"}
							size="default"
							onClick={() => toggleSubscription()}
							disabled={isToggling}
							className="gap-2"
						>
							{isSubscribed && <Bell className="w-4 h-4 fill-current" />}
							<span>{isSubscribed ? "Subscribed" : "Subscribe"}</span>
						</Button>
					) : (
						<Link href="/sign-in">
							<Button variant="subscribe" size="default">
								Subscribe
							</Button>
						</Link>
					)}
				</div>
			</div>
		</div>
	);
}
