"use client";

import * as React from "react";
import type { StudioVideo } from "../../hooks/useStudioVideos";

export interface VideoEditModalProps {
	video: StudioVideo | null;
	onClose: () => void;
	onSave: (id: string, input: Partial<StudioVideo>) => Promise<unknown>;
}

export function VideoEditModal({
	video,
	onClose,
	onSave,
}: VideoEditModalProps) {
	const [title, setTitle] = React.useState("");
	const [description, setDescription] = React.useState("");
	const [category, setCategory] = React.useState("Tech");
	const [visibility, setVisibility] = React.useState<
		"public" | "unlisted" | "private" | "scheduled"
	>("private");
	const [saving, setSaving] = React.useState(false);

	React.useEffect(() => {
		if (video) {
			setTitle(video.title);
			setDescription(video.description || "");
			setCategory(video.category || "Tech");
			setVisibility(video.visibility);
		}
	}, [video]);

	if (!video) return null;

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setSaving(true);
		try {
			await onSave(video.id, {
				title,
				description,
				category,
				visibility,
			});
			onClose();
		} finally {
			setSaving(false);
		}
	};

	return (
		<div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
			<div className="bg-[#1e1e1e] border border-[#303030] rounded-2xl w-full max-w-lg p-6 shadow-2xl">
				<div className="flex items-center justify-between mb-4">
					<h2 className="text-lg font-bold text-white">Video Details</h2>
					<button
						type="button"
						onClick={onClose}
						className="text-[#888] hover:text-white text-lg cursor-pointer"
					>
						✕
					</button>
				</div>

				<form onSubmit={handleSubmit} className="flex flex-col gap-4">
					<label className="flex flex-col gap-1 text-xs text-[#aaa]">
						Title
						<input
							type="text"
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							required
							className="bg-[#121212] border border-[#383838] rounded-xl px-3 py-2 text-sm text-white focus:border-[#3ea6ff] outline-none"
						/>
					</label>

					<label className="flex flex-col gap-1 text-xs text-[#aaa]">
						Description
						<textarea
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							rows={3}
							className="bg-[#121212] border border-[#383838] rounded-xl p-3 text-sm text-white focus:border-[#3ea6ff] outline-none resize-none"
						/>
					</label>

					<label className="flex flex-col gap-1 text-xs text-[#aaa]">
						Visibility
						<select
							value={visibility}
							onChange={(e) =>
								setVisibility(
									e.target.value as
										| "public"
										| "unlisted"
										| "private"
										| "scheduled",
								)
							}
							className="bg-[#121212] border border-[#383838] rounded-xl px-3 py-2 text-sm text-white focus:border-[#3ea6ff] outline-none cursor-pointer"
						>
							<option value="public">Public</option>
							<option value="unlisted">Unlisted</option>
							<option value="private">Private</option>
							<option value="scheduled">Scheduled</option>
						</select>
					</label>

					<div className="flex justify-end gap-3 mt-4">
						<button
							type="button"
							onClick={onClose}
							className="px-4 py-2 text-xs text-[#aaa] hover:text-white cursor-pointer"
						>
							Cancel
						</button>
						<button
							type="submit"
							disabled={saving}
							className="px-5 py-2 rounded-full bg-[#3ea6ff] text-black font-semibold text-xs hover:bg-[#65b8ff] disabled:opacity-50 cursor-pointer"
						>
							{saving ? "Saving..." : "Save"}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
