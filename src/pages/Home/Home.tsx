import { Count } from "./components/Count";

export const Home = () => {
	return (
		<>
			<div>
				<a
					href="https://vite.dev"
					target="_blank" rel="noopener"
				>
					<img
						src="/assets/favicon.ico"
						class="logo"
						alt="Vite logo"
					/>
				</a>
			</div>
			<h1>Vite + Preact</h1>
			<Count />
			<p class="bg-gray-200">
				Check out{" "}
				<a
					href="https://preactjs.com/guide/v10/getting-started#create-a-vite-powered-preact-app"
					target="_blank" rel="noopener"
				>
					create-preact
				</a>
				, the official Preact + Vite starter
			</p>
			<p class="read-the-docs">
				Click on the Vite and Preact logos to learn more
			</p>
		</>
	);
};
