"use client";

import { Button } from "@itube/ui";
import {
	Calendar,
	Eye,
	MessageSquare,
	MoreVertical,
	Pencil,
	Trash2,
} from "lucide-react";
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
		<div className="bg-[#1e1e1e] border border-[rgba(255,255,255,0.1)] rounded-2xl overflow-hidden shadow-2xl">
			<div className="p-5 border-b border-[rgba(255,255,255,0.1)] flex items-center justify-between">
				<h2 className="font-bold text-white text-lg">Channel Content</h2>
			</div>

			<div className="overflow-x-auto">
				<table className="w-full text-left text-sm text-[#f1f1f1]">
					<thead className="bg-[#121212] text-xs uppercase text-[#888] border-b border-[rgba(255,255,255,0.1)]">
						<tr>
							<th className="px-5 py-3.5">Video</th>
							<th className="px-5 py-3.5">Visibility</th>
							<th className="px-5 py-3.5">Date</th>
							<th className="px-5 py-3.5">Views</th>
							<th className="px-5 py-3.5">Comments</th>
							<th className="px-5 py-3.5 text-right">Actions</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-[rgba(255,255,255,0.06)]">
						{videos.length === 0 ? (
							<tr>
								<td colSpan={6} className="px-5 py-10 text-center text-[#888]">
									No videos uploaded yet.
								</td>
							</tr>
						) : (
							videos.map((v) => (
								<tr
									key={v.id}
									className="hover:bg-[rgba(255,255,255,0.04)] transition-colors"
								>
									<td className="px-5 py-3.5 flex items-center gap-3">
										<div className="w-24 aspect-video bg-[#121212] rounded-lg overflow-hidden shrink-0 border border-[rgba(255,255,255,0.1)]">
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
									<td className="px-5 py-3.5">
										<span
											className={`text-xs px-2.5 py-0.5 rounded-full uppercase font-medium border ${
												v.visibility === "public"
													? "bg-emerald-950 text-emerald-400 border-emerald-800"
													: v.visibility === "unlisted"
														? "bg-amber-950 text-amber-400 border-amber-800"
														: "bg-neutral-800 text-neutral-400 border-neutral-700"
											}`}
										>
											{v.visibility}
										</span>
									</td>
									<td className="px-5 py-3.5 text-xs text-[#888]">
										{new Date(v.createdAt).toLocaleDateString()}
									</td>
									<td className="px-5 py-3.5 text-xs">
										{v.viewCount.toLocaleString()}
									</td>
									<td className="px-5 py-3.5 text-xs">
										{v.commentCount.toLocaleString()}
									</td>
									<td className="px-5 py-3.5 text-right">
										<div className="flex items-center justify-end gap-2">
											<Button
												variant="ghost"
												size="sm"
												onClick={() => setEditingVideo(v)}
												className="text-xs text-[#3ea6ff] hover:text-[#65b8ff]"
											>
												<Pencil className="w-3.5 h-3.5 mr-1" />
												Edit
											</Button>
											<Button
												variant="ghost"
												size="sm"
												onClick={() => {
													if (confirm("Delete this video permanently?")) {
														onDelete(v.id);
													}
												}}
												className="text-xs text-red-400 hover:text-red-300"
											>
												<Trash2 className="w-3.5 h-3.5 mr-1" />
												Delete
											</Button>
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
