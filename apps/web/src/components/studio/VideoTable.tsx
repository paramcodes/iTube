"use client";

import * as React from "react";
import type { StudioVideo } from "../../hooks/useStudioVideos";
import { VideoEditModal } from "./VideoEditModal";

export interface VideoTableProps {
	videos: StudioVideo[];
	onUpdate: (id: string, input: Partial<StudioVideo>) => Promise<unknown>;
	onDelete: (id: string) => Promise<unknown>;
}

export function VideoTable({ videos, onUpdate, onDelete }: VideoTableProps) {
	const [editingVideo, setEditingVideo] = React.useState<StudioVideo | null>(
		null,
	);

	return (
		<div className="bg-[#1e1e1e] border border-[#303030] rounded-2xl overflow-hidden shadow-xl">
			<div className="p-4 border-b border-[#303030] flex items-center justify-between">
				<h2 className="font-bold text-white text-base">Channel Content</h2>
			</div>

			<div className="overflow-x-auto">
				<table className="w-full text-left text-sm text-[#f1f1f1]">
					<thead className="bg-[#121212] text-xs uppercase text-[#888] border-b border-[#303030]">
						<tr>
							<th className="px-4 py-3">Video</th>
							<th className="px-4 py-3">Visibility</th>
							<th className="px-4 py-3">Date</th>
							<th className="px-4 py-3">Views</th>
							<th className="px-4 py-3">Comments</th>
							<th className="px-4 py-3 text-right">Actions</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-[#272727]">
						{videos.length === 0 ? (
							<tr>
								<td colSpan={6} className="px-4 py-8 text-center text-[#888]">
									No videos uploaded yet.
								</td>
							</tr>
						) : (
							videos.map((v) => (
								<tr key={v.id} className="hover:bg-[#252525]">
									<td className="px-4 py-3 flex items-center gap-3">
										<div className="w-24 aspect-video bg-[#121212] rounded overflow-hidden shrink-0">
											{v.thumbnailUrl ? (
												<img
													src={v.thumbnailUrl}
													alt={v.title}
													className="w-full h-full object-cover"
												/>
											) : (
												<div className="w-full h-full flex items-center justify-center text-[10px] text-[#666]">
													Processing
												</div>
											)}
										</div>
										<span className="font-medium text-white line-clamp-1 max-w-xs">
											{v.title}
										</span>
									</td>
									<td className="px-4 py-3">
										<span
											className={`text-xs px-2 py-0.5 rounded-full uppercase font-medium ${
												v.visibility === "public"
													? "bg-emerald-950 text-emerald-400 border border-emerald-800"
													: v.visibility === "unlisted"
														? "bg-amber-950 text-amber-400 border border-amber-800"
														: "bg-neutral-800 text-neutral-400 border border-neutral-700"
											}`}
										>
											{v.visibility}
										</span>
									</td>
									<td className="px-4 py-3 text-xs text-[#888]">
										{new Date(v.createdAt).toLocaleDateString()}
									</td>
									<td className="px-4 py-3 text-xs">
										{v.viewCount.toLocaleString()}
									</td>
									<td className="px-4 py-3 text-xs">
										{v.commentCount.toLocaleString()}
									</td>
									<td className="px-4 py-3 text-right">
										<div className="flex items-center justify-end gap-2">
											<button
												type="button"
												onClick={() => setEditingVideo(v)}
												className="px-2.5 py-1 text-xs text-[#3ea6ff] hover:bg-[#3ea6ff]/10 rounded cursor-pointer"
											>
												Edit
											</button>
											<button
												type="button"
												onClick={() => {
													if (confirm("Delete this video permanently?")) {
														onDelete(v.id);
													}
												}}
												className="px-2.5 py-1 text-xs text-red-400 hover:bg-red-400/10 rounded cursor-pointer"
											>
												Delete
											</button>
										</div>
									</td>
								</tr>
							))
						)}
					</tbody>
				</table>
			</div>

			<VideoEditModal
				video={editingVideo}
				onClose={() => setEditingVideo(null)}
				onSave={onUpdate}
			/>
		</div>
	);
}
