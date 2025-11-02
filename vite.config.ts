import preact from "@preact/preset-vite";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
	plugins: [preact(), vitePWAOptions, tailwindcss()],
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
			react: "preact/compat",
			"react-dom": "preact/compat",
		},
	},
	define: {
		"import.meta.env.PROD": mode === "production",
		"import.meta.env.DEV": mode === "development",
		"import.meta.env.STAGING": mode === "staging",
	},
	preview: {
		port: 8080,
		strictPort: true,
		allowedHosts: ["hemline.studio", ".hemline.studio"],
	},
	server: {
		port: 5173,
		strictPort: true,
		host: true,
		origin: "http://0.0.0.0:5173",
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
				src: "/assets/brand/favicon.ico",
				type: "image/x-icon",
				sizes: "16x16 32x32",
			},
			{
				src: "/assets/brand/icon-192.png",
				type: "image/png",
				sizes: "192x192",
			},
			{
				src: "/assets/brand/icon-512.png",
				type: "image/png",
				sizes: "512x512",
			},
			{
				src: "/assets/brand/icon-192-maskable.png",
				type: "image/png",
				sizes: "192x192",
				purpose: "maskable",
			},
			{
				src: "/assets/brand/icon-512-maskable.png",
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
