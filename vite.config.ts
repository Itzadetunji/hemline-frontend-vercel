import { defineConfig } from "vite";
import { fileURLToPath } from "url";
import preact from "@preact/preset-vite";
import { VitePWA } from "vite-plugin-pwa";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
	plugins: [preact(), vitePWAOptions, tailwindcss()],
	resolve: {
		alias: {
			"@": fileURLToPath(new URL("./global", import.meta.url)),
		},
	},
	define: {
		"import.meta.env.PROD": mode === "production",
		"import.meta.env.DEV": mode === "development",
		"import.meta.env.STAGING": mode === "staging",
	},
}));

const vitePWAOptions = VitePWA({
	registerType: "autoUpdate",
	includeAssets: ["favicon.ico", "robots.txt", "apple-touch-icon.png"],
	manifest: {
		name: "Hemline",
		short_name: "Hemline",
		description: "A Preact PWA with TanStack Query and Axios",
		theme_color: "#75041D",
		background_color: "#75041D",
		display: "standalone",
		scope: "/",
		start_url: "/",
		icons: [
			{
				src: "/assets/favicon.ico",
				type: "image/x-icon",
				sizes: "16x16 32x32",
			},
			{ src: "/assets/icon-192.png", type: "image/png", sizes: "192x192" },
			{ src: "/assets/icon-512.png", type: "image/png", sizes: "512x512" },
			{
				src: "/assets/icon-192-maskable.png",
				type: "image/png",
				sizes: "192x192",
				purpose: "maskable",
			},
			{
				src: "/assets/icon-512-maskable.png",
				type: "image/png",
				sizes: "512x512",
				purpose: "maskable",
			},
		],
	},
	workbox: {
		globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
		runtimeCaching: [
			{
				urlPattern: /^https:\/\/api\.example\.com\/.*/i,
				handler: "NetworkFirst",
				options: {
					cacheName: "api-cache",
					expiration: {
						maxEntries: 50,
						maxAgeSeconds: 60 * 60 * 24, // 24 hours
					},
					cacheableResponse: {
						statuses: [0, 200],
					},
				},
			},
		],
	},
	devOptions: {
		enabled: true,
		type: "module",
	},
});
