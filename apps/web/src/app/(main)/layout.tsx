import type * as React from "react";
import Shell from "../../components/layout/Shell";

export default function MainLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <Shell>{children}</Shell>;
}
