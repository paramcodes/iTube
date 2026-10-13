"use client";

import { useUser } from "@clerk/nextjs";
import { Button } from "@itube/ui";
import Link from "next/link";
import * as React from "react";
import { usePostComment } from "../../hooks/usePostComment";

export function CommentComposer({ videoId }: { videoId: string }) {
	const { isSignedIn, user } = useUser();
	const [content, setContent] = React.useState("");
	const [isFocused, setIsFocused] = React.useState(false);
	const postMutation = usePostComment(videoId);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!content.trim()) return;

		postMutation.mutate(
			{ content: content.trim() },
			{
				onSuccess: () => {
					setContent("");
					setIsFocused(false);
				},
			},
		);
	};

	if (!isSignedIn) {
		return (
			<div className="bg-[#212121] border border-[rgba(255,255,255,0.1)] rounded-2xl p-4 text-sm text-[#aaa] flex items-center justify-between">
				<span>Sign in to join the conversation and leave a comment.</span>
				<Link href="/sign-in">
					<Button variant="outline" size="sm" className="rounded-full">
						Sign in
					</Button>
				</Link>
			</div>
		);
	}

	return (
		<form onSubmit={handleSubmit} className="flex gap-4 items-start">
			<div className="w-10 h-10 rounded-full bg-[#3d3d3d] overflow-hidden shrink-0 flex items-center justify-center text-sm font-semibold text-white select-none">
				{user?.imageUrl ? (
					<img
						src={user.imageUrl}
						alt="You"
						className="w-full h-full object-cover"
					/>
				) : (
					"U"
				)}
			</div>

			<div className="flex flex-col flex-1 gap-2">
				<textarea
					value={content}
					onChange={(e) => setContent(e.target.value)}
					onFocus={() => setIsFocused(true)}
					placeholder="Add a comment..."
					rows={isFocused || content ? 2 : 1}
					maxLength={5000}
					className="w-full bg-transparent border-b border-[rgba(255,255,255,0.2)] focus:border-white outline-none text-sm text-[#f1f1f1] placeholder-[#888] resize-none py-1.5 transition-all"
				/>
				{(isFocused || content) && (
					<div className="flex justify-end gap-2">
						<Button
							type="button"
							variant="ghost"
							size="sm"
							onClick={() => {
								setContent("");
								setIsFocused(false);
							}}
						>
							Cancel
						</Button>
						<Button
							type="submit"
							variant="default"
							size="sm"
							disabled={!content.trim() || postMutation.isPending}
							className="bg-[#3ea6ff] text-black font-semibold hover:bg-[#65b8ff] disabled:opacity-40"
						>
							Comment
						</Button>
					</div>
				)}
			</div>
		</form>
	);
}
