"use client";

import { env } from "@/env";
import type { CommentDto } from "@itube/types";
import * as React from "react";

export function CommentThread({ comment }: { comment: CommentDto }) {
	const [showReplies, setShowReplies] = React.useState(false);
	const [replies, setReplies] = React.useState<CommentDto[]>([]);
	const [loadingReplies, setLoadingReplies] = React.useState(false);

	const loadReplies = () => {
		if (replies.length > 0) {
			setShowReplies(!showReplies);
			return;
		}

		setLoadingReplies(true);
		fetch(`${env.NEXT_PUBLIC_API_URL}/api/comments/${comment.id}/replies`)
			.then((r) => r.json())
			.then((data) => {
				setReplies(data.items || []);
				setShowReplies(true);
				setLoadingReplies(false);
			})
			.catch(() => setLoadingReplies(false));
	};

	return (
		<div className="flex gap-3 items-start py-2">
			<div className="w-8 h-8 rounded-full bg-[#3d3d3d] overflow-hidden shrink-0 flex items-center justify-center text-xs font-bold text-white select-none">
				{comment.channel.avatarUrl ? (
					<img
						src={comment.channel.avatarUrl}
						alt={comment.channel.name}
						className="w-full h-full object-cover"
					/>
				) : (
					comment.channel.name.charAt(0)
				)}
			</div>

			<div className="flex flex-col flex-1 gap-1 text-sm">
				<div className="flex items-center gap-2">
					<span className="font-semibold text-xs text-white">
						@{comment.channel.handle}
					</span>
					<span className="text-[11px] text-[#888]">
						{new Date(comment.createdAt).toLocaleDateString()}
					</span>
				</div>

				<p className="text-[#f1f1f1] text-sm leading-relaxed whitespace-pre-wrap">
					{comment.content}
				</p>

				<div className="flex items-center gap-4 text-xs text-[#aaa] mt-1 select-none">
					<button
						type="button"
						className="flex items-center gap-1 hover:text-white cursor-pointer"
					>
						<span>👍</span>
						{comment.likeCount > 0 && <span>{comment.likeCount}</span>}
					</button>
					<button
						type="button"
						className="flex items-center gap-1 hover:text-white cursor-pointer"
					>
						<span>👎</span>
					</button>
				</div>

				{comment.replyCount > 0 && (
					<div className="mt-2">
						<button
							type="button"
							onClick={loadReplies}
							className="text-xs text-[#3ea6ff] font-medium hover:underline cursor-pointer flex items-center gap-1"
						>
							<span>{showReplies ? "▼ Hide" : "▶ View"}</span>
							<span>
								{comment.replyCount}{" "}
								{comment.replyCount === 1 ? "reply" : "replies"}
							</span>
						</button>

						{loadingReplies && (
							<div className="text-xs text-[#888] mt-1">Loading replies...</div>
						)}

						{showReplies && replies.length > 0 && (
							<div className="pl-4 border-l border-[#3d3d3d] flex flex-col gap-2 mt-2">
								{replies.map((reply) => (
									<div key={reply.id} className="flex gap-2 items-start py-1">
										<div className="w-6 h-6 rounded-full bg-[#3d3d3d] overflow-hidden shrink-0 flex items-center justify-center text-[10px] font-bold text-white select-none">
											{reply.channel.avatarUrl ? (
												<img
													src={reply.channel.avatarUrl}
													alt={reply.channel.name}
													className="w-full h-full object-cover"
												/>
											) : (
												reply.channel.name.charAt(0)
											)}
										</div>
										<div className="flex flex-col flex-1 text-xs">
											<div className="flex items-center gap-2">
												<span className="font-semibold text-white">
													@{reply.channel.handle}
												</span>
												<span className="text-[10px] text-[#888]">
													{new Date(reply.createdAt).toLocaleDateString()}
												</span>
											</div>
											<p className="text-[#f1f1f1] mt-0.5 whitespace-pre-wrap">
												{reply.content}
											</p>
										</div>
									</div>
								))}
							</div>
						)}
					</div>
				)}
			</div>
		</div>
	);
}
