import type { Metadata } from "next";
import type * as React from "react";
import { Providers } from "../components/providers";
import "./globals.css";

export const metadata: Metadata = {
	title: "iTube",
	description: "Pixel-accurate YouTube clone powered by Next.js & Elysia",
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en">
			<body>
				<Providers>{children}</Providers>
			</body>
		</html>
	);
}
