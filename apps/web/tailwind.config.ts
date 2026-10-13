import { tailwindPreset } from "@itube/ui";

const config = {
	presets: [tailwindPreset],
	content: ["./src/**/*.{ts,tsx}", "../../packages/ui/src/**/*.{ts,tsx}"],
};

export default config;
