"use client";

import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import * as React from "react";
import { usePostComment } from "../../hooks/usePostComment";

export function CommentComposer({ videoId }: { videoId: string }) {
	const { isSignedIn } = useUser();
	const [content, setContent] = React.useState("");
	const postMutation = usePostComment(videoId);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!content.trim()) return;

		postMutation.mutate(
			{ content: content.trim() },
			{
				onSuccess: () => setContent(""),
			},
		);
	};

	if (!isSignedIn) {
		return (
			<div className="bg-[#272727] rounded-xl p-4 text-sm text-[#aaa] flex items-center justify-between">
				<span>Sign in to join the conversation and leave a comment.</span>
				<Link
					href="/sign-in"
					className="text-[#3ea6ff] font-medium hover:underline text-xs"
				>
					Sign in
				</Link>
			</div>
		);
	}

	return (
		<form onSubmit={handleSubmit} className="flex flex-col gap-2">
			<textarea
				value={content}
				onChange={(e) => setContent(e.target.value)}
				placeholder="Add a comment..."
				rows={2}
				maxLength={5000}
				className="w-full bg-transparent border-b border-[#3d3d3d] focus:border-white outline-none text-sm text-[#f1f1f1] placeholder-[#888] resize-none py-1.5 transition-colors"
			/>
			<div className="flex justify-end gap-2">
				<button
					type="button"
					onClick={() => setContent("")}
					className="px-3 py-1.5 text-xs text-[#aaa] hover:text-white cursor-pointer"
				>
					Cancel
				</button>
				<button
					type="submit"
					disabled={!content.trim() || postMutation.isPending}
					className="px-4 py-1.5 rounded-full bg-[#3ea6ff] text-black font-semibold text-xs hover:bg-[#65b8ff] disabled:opacity-40 disabled:hover:bg-[#3ea6ff] cursor-pointer"
				>
					Comment
				</button>
			</div>
		</form>
	);
}
