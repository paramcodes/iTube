"use client";

import { env } from "@/env";
import { useRouter } from "next/navigation";
import * as React from "react";

type UploadState =
	| "idle"
	| "presigning"
	| "uploading"
	| "processing"
	| "done"
	| "error";

export function UploadForm() {
	const router = useRouter();
	const [file, setFile] = React.useState<File | null>(null);
	const [title, setTitle] = React.useState("");
	const [description, setDescription] = React.useState("");
	const [category, setCategory] = React.useState("Tech");
	const [status, setStatus] = React.useState<UploadState>("idle");
	const [progress, setProgress] = React.useState(0);
	const [errorMessage, setErrorMessage] = React.useState("");

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!file || !title.trim()) return;

		try {
			setStatus("presigning");
			setErrorMessage("");

			const presignRes = await fetch(
				`${env.NEXT_PUBLIC_API_URL}/api/upload/presign`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Authorization: "Bearer test_token",
					},
					body: JSON.stringify({
						title: title.trim(),
						description: description.trim(),
						category,
					}),
				},
			);

			if (!presignRes.ok) {
				throw new Error("Failed to get direct upload URL");
			}

			const { uploadUrl, videoId } = await presignRes.json();

			setStatus("uploading");

			const xhr = new XMLHttpRequest();
			xhr.open("PUT", uploadUrl, true);

			xhr.upload.onprogress = (evt) => {
				if (evt.lengthComputable) {
					const percent = Math.round((evt.loaded / evt.total) * 100);
					setProgress(percent);
				}
			};

			xhr.onload = () => {
				if (xhr.status >= 200 && xhr.status < 300) {
					setStatus("processing");
					const pollInterval = setInterval(async () => {
						try {
							const checkRes = await fetch(
								`${env.NEXT_PUBLIC_API_URL}/api/videos/${videoId}`,
							);
							if (checkRes.ok) {
								const vid = await checkRes.json();
								if (vid.muxPlaybackId) {
									clearInterval(pollInterval);
									setStatus("done");
									router.push("/studio");
								}
							}
						} catch {
							// Ignore polling err
						}
					}, 3000);
				} else {
					setStatus("error");
					setErrorMessage("Upload to Mux failed");
				}
			};

			xhr.onerror = () => {
				setStatus("error");
				setErrorMessage("Network error during upload");
			};

			xhr.send(file);
		} catch (err: unknown) {
			setStatus("error");
			setErrorMessage(
				err instanceof Error ? err.message : "Unknown error occurred",
			);
		}
	};

	return (
		<div className="max-w-2xl mx-auto py-8">
			<div className="bg-[#1e1e1e] border border-[#303030] rounded-2xl p-6 shadow-xl">
				<h1 className="text-xl font-bold text-white mb-6">Upload Video</h1>

				{errorMessage && (
					<div className="bg-red-950/60 border border-red-800 text-red-200 text-sm p-3 rounded-xl mb-6">
						{errorMessage}
					</div>
				)}

				<form onSubmit={handleSubmit} className="flex flex-col gap-4">
					<label className="flex flex-col gap-1.5 text-xs font-semibold text-[#aaa] uppercase tracking-wider">
						Video File
						<input
							type="file"
							accept="video/*"
							onChange={(e) => {
								const selected = e.target.files?.[0];
								if (selected) {
									setFile(selected);
									if (!title) setTitle(selected.name.replace(/\.[^/.]+$/, ""));
								}
							}}
							disabled={status !== "idle" && status !== "error"}
							className="bg-[#121212] border border-[#383838] rounded-xl p-3 text-sm text-[#f1f1f1] file:mr-4 file:py-1.5 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-[#272727] file:text-white hover:file:bg-[#383838] cursor-pointer"
						/>
					</label>

					<label className="flex flex-col gap-1.5 text-xs font-semibold text-[#aaa] uppercase tracking-wider">
						Title
						<input
							type="text"
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							placeholder="Add a title that describes your video"
							maxLength={100}
							required
							disabled={status !== "idle" && status !== "error"}
							className="bg-[#121212] border border-[#383838] rounded-xl px-4 py-2.5 text-sm text-white focus:border-[#3ea6ff] outline-none"
						/>
					</label>

					<label className="flex flex-col gap-1.5 text-xs font-semibold text-[#aaa] uppercase tracking-wider">
						Description
						<textarea
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							placeholder="Tell viewers about your video"
							rows={4}
							maxLength={5000}
							disabled={status !== "idle" && status !== "error"}
							className="bg-[#121212] border border-[#383838] rounded-xl p-4 text-sm text-white focus:border-[#3ea6ff] outline-none resize-none"
						/>
					</label>

					<label className="flex flex-col gap-1.5 text-xs font-semibold text-[#aaa] uppercase tracking-wider">
						Category
						<select
							value={category}
							onChange={(e) => setCategory(e.target.value)}
							disabled={status !== "idle" && status !== "error"}
							className="bg-[#121212] border border-[#383838] rounded-xl px-4 py-2.5 text-sm text-white focus:border-[#3ea6ff] outline-none cursor-pointer"
						>
							{[
								"Music",
								"Gaming",
								"Podcasts",
								"Tech",
								"News",
								"Education",
								"Entertainment",
								"Science",
							].map((c) => (
								<option key={c} value={c}>
									{c}
								</option>
							))}
						</select>
					</label>

					{status === "uploading" && (
						<div className="flex flex-col gap-2 mt-2">
							<div className="flex justify-between text-xs text-[#aaa]">
								<span>Uploading to Mux...</span>
								<span>{progress}%</span>
							</div>
							<div className="w-full bg-[#121212] rounded-full h-2 overflow-hidden">
								<div
									className="bg-[#ff0000] h-full transition-all duration-150"
									style={{ width: `${progress}%` }}
								/>
							</div>
						</div>
					)}

					{status === "processing" && (
						<div className="text-xs text-[#3ea6ff] py-2 animate-pulse text-center">
							Processing video... Hang tight, redirecting to Studio soon!
						</div>
					)}

					<div className="flex justify-end gap-3 mt-4">
						<button
							type="submit"
							disabled={
								!file ||
								!title.trim() ||
								(status !== "idle" && status !== "error")
							}
							className="px-6 py-2.5 rounded-full bg-[#ff0000] hover:bg-[#cc0000] disabled:opacity-40 text-white font-semibold text-sm cursor-pointer transition-colors"
						>
							{status === "presigning"
								? "Creating upload..."
								: status === "uploading"
									? "Uploading..."
									: "Upload Video"}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
